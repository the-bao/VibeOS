import { BaseAgent, AgentContext } from './base';
import { LLMClient } from '../llm/client';
/**
 * Auditor Agent - Test result verification and diff calculation
 * Runs tests and calculates the difference between current and desired state.
 *
 * Logic Diff: Number of unit test failures
 * Visual Diff: Number of E2E test failures
 * Total Diff = Logic Diff + Visual Diff
 */
export declare class AuditorAgent extends BaseAgent {
    constructor(llmClient: LLMClient);
    /**
     * Analyze test results and calculate diff.
     */
    execute(context: AgentContext): Promise<string>;
    getSystemPrompt(): string;
    private buildPrompt;
}
//# sourceMappingURL=auditor.d.ts.map