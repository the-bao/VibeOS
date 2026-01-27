// tests/unit/core/state-machine.test.ts
import { describe, it, expect, beforeEach } from '@jest/globals';
import { StateMachine } from '../../../src/core/state-machine.js';
import { Phase } from '../../../src/core/types.js';

describe('StateMachine', () => {
  let sm: StateMachine;

  beforeEach(() => {
    sm = new StateMachine();
  });

  describe('constructor', () => {
    it('should initialize with Pending phase', () => {
      expect(sm.getCurrentPhase()).toBe('Pending');
    });

    it('should initialize with zero loops', () => {
      expect(sm.getLoopCount()).toBe(0);
    });
  });

  describe('transition', () => {
    it('should transition to Reconciling', () => {
      sm.transition('Reconciling');
      expect(sm.getCurrentPhase()).toBe('Reconciling');
    });

    it('should transition to Ready', () => {
      sm.transition('Reconciling');
      sm.transition('Ready');
      expect(sm.getCurrentPhase()).toBe('Ready');
    });

    it('should transition to Failed', () => {
      sm.transition('Reconciling');
      sm.transition('Failed');
      expect(sm.getCurrentPhase()).toBe('Failed');
    });
  });

  describe('checkTransition', () => {
    it('should transition to Ready when diff is 0', () => {
      sm.transition('Reconciling');
      const newPhase = sm.checkTransition(0);
      expect(newPhase).toBe('Ready');
    });

    it('should stay Reconciling when diff > 0 and under max loops', () => {
      sm.transition('Reconciling');
      const newPhase = sm.checkTransition(5, 5);
      expect(newPhase).toBe('Reconciling');
    });

    it('should transition to Failed after max loops', () => {
      sm.transition('Reconciling');
      const newPhase = sm.checkTransition(1, 10);
      expect(newPhase).toBe('Failed');
    });

    it('should transition to Failed when exceeding max loops', () => {
      sm.transition('Reconciling');
      const newPhase = sm.checkTransition(1, 11);
      expect(newPhase).toBe('Failed');
    });

    it('should use current loop count if not provided', () => {
      sm.transition('Reconciling');
      sm.incrementLoop();
      sm.incrementLoop();
      sm.incrementLoop();
      const newPhase = sm.checkTransition(1);
      expect(newPhase).toBe('Reconciling');
    });
  });

  describe('incrementLoop', () => {
    it('should increment loop count', () => {
      sm.incrementLoop();
      expect(sm.getLoopCount()).toBe(1);

      sm.incrementLoop();
      expect(sm.getLoopCount()).toBe(2);
    });
  });

  describe('getLoopCount', () => {
    it('should return current loop count', () => {
      expect(sm.getLoopCount()).toBe(0);
      sm.incrementLoop();
      expect(sm.getLoopCount()).toBe(1);
    });
  });

  describe('reset', () => {
    it('should reset to initial state', () => {
      sm.transition('Reconciling');
      sm.incrementLoop();
      sm.incrementLoop();

      sm.reset();

      expect(sm.getCurrentPhase()).toBe('Pending');
      expect(sm.getLoopCount()).toBe(0);
    });
  });
});
