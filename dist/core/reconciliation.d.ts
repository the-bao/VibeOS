import { VibeManifest, ReconciliationResult, LoopResult, CrashLoopConfig } from './types.js';
import { LLMClient } from '../llm/client.js';
/**
 * ReconciliationEngine orchestrates the complete reconciliation loop
 * It coordinates the three agents to achieve the desired state
 */
export declare class ReconciliationEngine {
    private llmClient;
    private specifierAgent;
    private coderAgent;
    private auditorAgent;
    private stateMachine;
    private config;
    constructor(llmClient: LLMClient, config?: Partial<CrashLoopConfig>);
    /**
     * Execute the full reconciliation loop
     * @param manifest - The VibeManifest specifying desired state
     * @returns The reconciliation result
     */
    reconcile(manifest: VibeManifest): Promise<ReconciliationResult>;
    /**
     * Execute a single reconciliation loop iteration
     */
    private executeLoop;
    /**
     * Detect if we're in a crash loop or stagnation state
     * This is the main crash loop detection function
     *
     * @param history - Array of previous loop results
     * @returns true if crash loop detected, false otherwise
     */
    detectCrashLoop(history: LoopResult[]): boolean;
}
//# sourceMappingURL=reconciliation.d.ts.map