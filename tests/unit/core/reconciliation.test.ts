// tests/unit/core/reconciliation.test.ts
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { ReconciliationEngine } from '../../../src/core/reconciliation.js';
import { VibeManifest, LoopResult } from '../../../src/core/types.js';
import { LLMClient } from '../../../src/llm/client.js';

// Mock LLMClient
jest.mock('../../../src/llm/client.js');

describe('ReconciliationEngine', () => {
  let engine: ReconciliationEngine;
  let mockLLMClient: jest.Mocked<LLMClient>;
  let mockManifest: VibeManifest;

  beforeEach(() => {
    // Create a mock LLMClient
    mockLLMClient = {
      completeSystem: jest.fn().mockResolvedValue({
        content: 'mock response',
        usage: { inputTokens: 100, outputTokens: 50 },
      }),
    } as any;

    // Mock the constructor to return our mock
    (LLMClient as jest.MockedClass<typeof LLMClient>).mockImplementation(
      () => mockLLMClient
    );

    engine = new ReconciliationEngine(mockLLMClient);

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
          behaviors: ['should initialize', 'should respond']
        }
      },
      status: { phase: 'Pending', currentLoop: 0 }
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should create engine with default config', () => {
      expect(engine).toBeInstanceOf(ReconciliationEngine);
    });

    it('should accept custom config', () => {
      const customEngine = new ReconciliationEngine(mockLLMClient, {
        maxTotalLoops: 20,
        maxStagnationCount: 3,
        stagnationThreshold: 0.05
      });
      expect(customEngine).toBeInstanceOf(ReconciliationEngine);
    });
  });

  describe('reconcile', () => {
    it('should run through complete loop with success', async () => {
      // Mock the agents to return successful responses
      jest.spyOn(engine['specifierAgent'], 'execute').mockResolvedValue('test code');
      jest.spyOn(engine['coderAgent'], 'execute').mockResolvedValue('impl code');
      jest.spyOn(engine['auditorAgent'], 'execute').mockResolvedValue(
        JSON.stringify({ totalDiff: 0, logicDiff: 0, visualDiff: 0, passedTests: 5, failedTests: 0, analysis: 'All pass' })
      );

      const result = await engine.reconcile(mockManifest);

      expect(result.success).toBe(true);
      expect(result.totalLoops).toBe(1);
      expect(result.finalPhase).toBe('Ready');
      expect(mockManifest.status.phase).toBe('Ready');
    });

    it('should handle multiple loops before convergence', async () => {
      let callCount = 0;
      jest.spyOn(engine['specifierAgent'], 'execute').mockResolvedValue('test');
      jest.spyOn(engine['coderAgent'], 'execute').mockResolvedValue('code');
      jest.spyOn(engine['auditorAgent'], 'execute').mockImplementation(async () => {
        callCount++;
        if (callCount < 3) {
          return JSON.stringify({ totalDiff: 2, logicDiff: 2, visualDiff: 0, passedTests: 0, failedTests: 2, analysis: 'Failing' });
        }
        return JSON.stringify({ totalDiff: 0, logicDiff: 0, visualDiff: 0, passedTests: 2, failedTests: 0, analysis: 'Pass' });
      });

      const result = await engine.reconcile(mockManifest);

      expect(result.totalLoops).toBe(3);
      expect(result.success).toBe(true);
      expect(result.finalPhase).toBe('Ready');
    });

    it('should detect stagnation and fail', async () => {
      jest.spyOn(engine['specifierAgent'], 'execute').mockResolvedValue('test');
      jest.spyOn(engine['coderAgent'], 'execute').mockResolvedValue('code');
      jest.spyOn(engine['auditorAgent'], 'execute').mockResolvedValue(
        JSON.stringify({ totalDiff: 5, logicDiff: 5, visualDiff: 0, passedTests: 0, failedTests: 5, analysis: 'No progress' })
      );

      const result = await engine.reconcile(mockManifest);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Crash loop detected');
    });

    it('should fail after max loops', async () => {
      let callCount = 0;
      jest.spyOn(engine['specifierAgent'], 'execute').mockResolvedValue('test');
      jest.spyOn(engine['coderAgent'], 'execute').mockResolvedValue('code');
      jest.spyOn(engine['auditorAgent'], 'execute').mockImplementation(async () => {
        callCount++;
        // Vary the diff slightly to avoid stagnation detection (improvement >= 10%)
        const diff = callCount % 2 === 0 ? 10 : 9;
        return JSON.stringify({ totalDiff: diff, logicDiff: diff, visualDiff: 0, passedTests: 0, failedTests: diff, analysis: 'Still failing' });
      });

      const result = await engine.reconcile(mockManifest);

      expect(result.success).toBe(false);
      expect(result.totalLoops).toBe(10);
      expect(result.error).toContain('Max loops exceeded');
    });

    it('should handle agent errors gracefully', async () => {
      jest.spyOn(engine['specifierAgent'], 'execute').mockRejectedValue(
        new Error('Specifier failed')
      );

      const result = await engine.reconcile(mockManifest);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Specifier failed');
      expect(mockManifest.status.phase).toBe('Failed');
    });

    it('should track loop history', async () => {
      jest.spyOn(engine['specifierAgent'], 'execute').mockResolvedValue('test');
      jest.spyOn(engine['coderAgent'], 'execute').mockResolvedValue('code');
      jest.spyOn(engine['auditorAgent'], 'execute').mockResolvedValue(
        JSON.stringify({ totalDiff: 0, logicDiff: 0, visualDiff: 0, passedTests: 1, failedTests: 0, analysis: 'Pass' })
      );

      const result = await engine.reconcile(mockManifest);

      expect(result.loopHistory).toHaveLength(1);
      expect(result.loopHistory[0].loopNumber).toBe(1);
      expect(result.loopHistory[0].diff).toBe(0);
    });
  });

  describe('detectCrashLoop', () => {
    it('should detect crash loop with repeated failures', () => {
      const history: LoopResult[] = [
        { loopNumber: 1, phase: 'coder', success: false, diff: 5, timestamp: new Date() },
        { loopNumber: 2, phase: 'coder', success: false, diff: 5, timestamp: new Date() },
        { loopNumber: 3, phase: 'coder', success: false, diff: 5, timestamp: new Date() },
        { loopNumber: 4, phase: 'coder', success: false, diff: 5, timestamp: new Date() },
        { loopNumber: 5, phase: 'coder', success: false, diff: 5, timestamp: new Date() },
      ];

      const isCrashLoop = engine['detectCrashLoop'](history);
      expect(isCrashLoop).toBe(true);
    });

    it('should not detect crash loop with improving diffs', () => {
      const history: LoopResult[] = [
        { loopNumber: 1, phase: 'coder', success: false, diff: 10, timestamp: new Date() },
        { loopNumber: 2, phase: 'coder', success: false, diff: 8, timestamp: new Date() },
        { loopNumber: 3, phase: 'coder', success: false, diff: 5, timestamp: new Date() },
        { loopNumber: 4, phase: 'coder', success: false, diff: 3, timestamp: new Date() },
        { loopNumber: 5, phase: 'coder', success: false, diff: 1, timestamp: new Date() },
      ];

      const isCrashLoop = engine['detectCrashLoop'](history);
      expect(isCrashLoop).toBe(false);
    });

    it('should not detect crash loop with insufficient history', () => {
      const history: LoopResult[] = [
        { loopNumber: 1, phase: 'coder', success: false, diff: 5, timestamp: new Date() },
        { loopNumber: 2, phase: 'coder', success: false, diff: 5, timestamp: new Date() },
      ];

      const isCrashLoop = engine['detectCrashLoop'](history);
      expect(isCrashLoop).toBe(false);
    });

    it('should detect stagnation when improvement is below threshold', () => {
      const history: LoopResult[] = [
        { loopNumber: 1, phase: 'coder', success: false, diff: 100, timestamp: new Date() },
        { loopNumber: 2, phase: 'coder', success: false, diff: 99, timestamp: new Date() },
        { loopNumber: 3, phase: 'coder', success: false, diff: 98, timestamp: new Date() },
        { loopNumber: 4, phase: 'coder', success: false, diff: 97, timestamp: new Date() },
        { loopNumber: 5, phase: 'coder', success: false, diff: 96, timestamp: new Date() },
      ];

      const isCrashLoop = engine['detectCrashLoop'](history);
      expect(isCrashLoop).toBe(true);
    });
  });

  describe('executeLoop', () => {
    it('should execute all three agents in sequence', async () => {
      const specifierSpy = jest.spyOn(engine['specifierAgent'], 'execute').mockResolvedValue('test code');
      const coderSpy = jest.spyOn(engine['coderAgent'], 'execute').mockResolvedValue('impl code');
      const auditorSpy = jest.spyOn(engine['auditorAgent'], 'execute').mockResolvedValue(
        JSON.stringify({ totalDiff: 0, logicDiff: 0, visualDiff: 0, passedTests: 1, failedTests: 0, analysis: 'Pass' })
      );

      const result = await engine['executeLoop'](mockManifest, 1, []);

      expect(specifierSpy).toHaveBeenCalled();
      expect(coderSpy).toHaveBeenCalled();
      expect(auditorSpy).toHaveBeenCalled();
      expect(result.loopNumber).toBe(1);
      expect(result.diff).toBe(0);
    });

    it('should capture agent outputs in output field', async () => {
      jest.spyOn(engine['specifierAgent'], 'execute').mockResolvedValue('test code');
      jest.spyOn(engine['coderAgent'], 'execute').mockResolvedValue('impl code');
      jest.spyOn(engine['auditorAgent'], 'execute').mockResolvedValue(
        JSON.stringify({ totalDiff: 0, logicDiff: 0, visualDiff: 0, passedTests: 1, failedTests: 0, analysis: 'Pass' })
      );

      const result = await engine['executeLoop'](mockManifest, 1, []);

      expect(result.output).toBeDefined();
      expect(result.output).toContain('totalDiff');
    });
  });
});
