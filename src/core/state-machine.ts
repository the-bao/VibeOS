// src/core/state-machine.ts
import { Phase } from './types.js';

/**
 * StateMachine manages phase transitions for reconciliation
 * Tracks the current phase and loop count to determine when to stop
 */
export class StateMachine {
  private currentPhase: Phase;
  private loopCount: number;
  private readonly maxLoops: number;

  constructor(maxLoops: number = 10) {
    this.currentPhase = 'Pending';
    this.loopCount = 0;
    this.maxLoops = maxLoops;
  }

  /**
   * Get the current phase
   */
  getCurrentPhase(): Phase {
    return this.currentPhase;
  }

  /**
   * Manually transition to a new phase
   */
  transition(newPhase: Phase): void {
    this.currentPhase = newPhase;
  }

  /**
   * Determine the next phase based on diff and loop count
   * @param diff - Current diff value (number of failing tests)
   * @param currentLoop - Current loop number (optional, defaults to internal count)
   * @returns The next phase
   */
  checkTransition(diff: number, currentLoop?: number): Phase {
    const loop = currentLoop ?? this.loopCount;

    // If all tests pass, we're ready
    if (diff === 0) {
      return 'Ready';
    }

    // If we've exceeded max loops, we failed
    if (loop >= this.maxLoops) {
      return 'Failed';
    }

    // Otherwise, keep reconciling
    return 'Reconciling';
  }

  /**
   * Increment the loop counter
   */
  incrementLoop(): void {
    this.loopCount++;
  }

  /**
   * Get the current loop count
   */
  getLoopCount(): number {
    return this.loopCount;
  }

  /**
   * Reset the state machine
   */
  reset(): void {
    this.currentPhase = 'Pending';
    this.loopCount = 0;
  }

  /**
   * Get the maximum loops allowed
   */
  getMaxLoops(): number {
    return this.maxLoops;
  }
}
