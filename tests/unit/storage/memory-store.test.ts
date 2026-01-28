import { MemoryStateStore } from '../../../src/storage/memory-store.js';
import { VibeManifest, LoopResult } from '../../../src/core/types.js';

describe('MemoryStateStore', () => {
  let store: MemoryStateStore;
  let mockManifest: VibeManifest;

  beforeEach(() => {
    store = new MemoryStateStore();
    mockManifest = {
      metadata: { name: 'test-component', version: '1.0.0' },
      spec: {
        intent: 'A test component',
        constraints: {
          framework: 'React',
          language: 'TypeScript',
          testing: ['Jest']
        },
        functionalSpec: {
          states: ['idle', 'active'],
          behaviors: ['should render', 'should handle click']
        }
      },
      status: { phase: 'Pending', currentLoop: 0 }
    };
  });

  describe('Manifest Storage', () => {
    it('should store a manifest', () => {
      store.setManifest('test-id', mockManifest);
      const retrieved = store.getManifest('test-id');

      expect(retrieved).toBeDefined();
      expect(retrieved?.metadata.name).toBe('test-component');
    });

    it('should return undefined for non-existent manifest', () => {
      const retrieved = store.getManifest('non-existent');
      expect(retrieved).toBeUndefined();
    });

    it('should update an existing manifest', () => {
      store.setManifest('test-id', mockManifest);

      const updated = { ...mockManifest, status: { phase: 'Reconciling' as const, currentLoop: 1 } };
      store.setManifest('test-id', updated);

      const retrieved = store.getManifest('test-id');
      expect(retrieved?.status.phase).toBe('Reconciling');
      expect(retrieved?.status.currentLoop).toBe(1);
    });

    it('should list all manifest IDs', () => {
      store.setManifest('id1', mockManifest);
      store.setManifest('id2', { ...mockManifest, metadata: { name: 'component2', version: '1.0.0' } });

      const ids = store.listManifests();
      expect(ids).toHaveLength(2);
      expect(ids).toContain('id1');
      expect(ids).toContain('id2');
    });

    it('should delete a manifest', () => {
      store.setManifest('test-id', mockManifest);
      expect(store.getManifest('test-id')).toBeDefined();

      store.deleteManifest('test-id');
      expect(store.getManifest('test-id')).toBeUndefined();
    });
  });

  describe('Loop History Storage', () => {
    it('should store loop results', () => {
      const loopResult: LoopResult = {
        loopNumber: 1,
        phase: 'specifier',
        success: true,
        diff: 5,
        output: 'test code',
        timestamp: new Date()
      };

      store.appendLoopResult('test-id', loopResult);
      const history = store.getLoopHistory('test-id');

      expect(history).toHaveLength(1);
      expect(history[0].loopNumber).toBe(1);
      expect(history[0].diff).toBe(5);
    });

    it('should append multiple loop results in order', () => {
      const loop1: LoopResult = {
        loopNumber: 1,
        phase: 'specifier',
        success: true,
        diff: 5,
        output: 'test output',
        timestamp: new Date()
      };

      const loop2: LoopResult = {
        loopNumber: 2,
        phase: 'coder',
        success: true,
        diff: 3,
        output: 'code output',
        timestamp: new Date()
      };

      store.appendLoopResult('test-id', loop1);
      store.appendLoopResult('test-id', loop2);

      const history = store.getLoopHistory('test-id');
      expect(history).toHaveLength(2);
      expect(history[0].loopNumber).toBe(1);
      expect(history[1].loopNumber).toBe(2);
    });

    it('should return empty array for non-existent history', () => {
      const history = store.getLoopHistory('non-existent');
      expect(history).toEqual([]);
    });

    it('should clear loop history', () => {
      const loopResult: LoopResult = {
        loopNumber: 1,
        phase: 'specifier',
        success: true,
        diff: 5,
        timestamp: new Date()
      };

      store.appendLoopResult('test-id', loopResult);
      expect(store.getLoopHistory('test-id')).toHaveLength(1);

      store.clearLoopHistory('test-id');
      expect(store.getLoopHistory('test-id')).toEqual([]);
    });
  });

  describe('Store Management', () => {
    it('should clear all data', () => {
      store.setManifest('id1', mockManifest);
      store.appendLoopResult('id1', {
        loopNumber: 1,
        phase: 'specifier',
        success: true,
        diff: 5,
        timestamp: new Date()
      });

      store.clear();

      expect(store.getManifest('id1')).toBeUndefined();
      expect(store.getLoopHistory('id1')).toEqual([]);
    });

    it('should track manifest count', () => {
      expect(store.getManifestCount()).toBe(0);

      store.setManifest('id1', mockManifest);
      expect(store.getManifestCount()).toBe(1);

      store.setManifest('id2', mockManifest);
      expect(store.getManifestCount()).toBe(2);

      store.deleteManifest('id1');
      expect(store.getManifestCount()).toBe(1);
    });
  });
});
