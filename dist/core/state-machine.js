/**
 * StateMachine manages phase transitions for reconciliation
 * Tracks the current phase and loop count to determine when to stop
 */
export class StateMachine {
    currentPhase;
    loopCount;
    maxLoops;
    constructor(maxLoops = 10) {
        this.currentPhase = 'Pending';
        this.loopCount = 0;
        this.maxLoops = maxLoops;
    }
    /**
     * Get the current phase
     */
    getCurrentPhase() {
        return this.currentPhase;
    }
    /**
     * Manually transition to a new phase
     */
    transition(newPhase) {
        this.currentPhase = newPhase;
    }
    /**
     * Determine the next phase based on diff and loop count
     * @param diff - Current diff value (number of failing tests)
     * @param currentLoop - Current loop number (optional, defaults to internal count)
     * @returns The next phase
     */
    checkTransition(diff, currentLoop) {
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
    incrementLoop() {
        this.loopCount++;
    }
    /**
     * Get the current loop count
     */
    getLoopCount() {
        return this.loopCount;
    }
    /**
     * Reset the state machine
     */
    reset() {
        this.currentPhase = 'Pending';
        this.loopCount = 0;
    }
    /**
     * Get the maximum loops allowed
     */
    getMaxLoops() {
        return this.maxLoops;
    }
}
//# sourceMappingURL=state-machine.js.map