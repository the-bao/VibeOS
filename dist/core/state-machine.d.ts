import { Phase } from './types.js';
/**
 * StateMachine manages phase transitions for reconciliation
 * Tracks the current phase and loop count to determine when to stop
 */
export declare class StateMachine {
    private currentPhase;
    private loopCount;
    private readonly maxLoops;
    constructor(maxLoops?: number);
    /**
     * Get the current phase
     */
    getCurrentPhase(): Phase;
    /**
     * Manually transition to a new phase
     */
    transition(newPhase: Phase): void;
    /**
     * Determine the next phase based on diff and loop count
     * @param diff - Current diff value (number of failing tests)
     * @param currentLoop - Current loop number (optional, defaults to internal count)
     * @returns The next phase
     */
    checkTransition(diff: number, currentLoop?: number): Phase;
    /**
     * Increment the loop counter
     */
    incrementLoop(): void;
    /**
     * Get the current loop count
     */
    getLoopCount(): number;
    /**
     * Reset the state machine
     */
    reset(): void;
    /**
     * Get the maximum loops allowed
     */
    getMaxLoops(): number;
}
//# sourceMappingURL=state-machine.d.ts.map