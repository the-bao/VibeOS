import { BaseAgent, AgentContext } from './base.js';
import { LLMClient } from '../llm/client.js';
/**
 * CoderAgent generates implementation code to make tests pass
 * Analyzes test failures and generates minimal fixes
 */
export declare class CoderAgent extends BaseAgent {
    constructor(llmClient?: LLMClient);
    /**
     * Generate implementation code from test failures
     * @param context - Agent context containing manifest and test results
     * @returns Implementation code
     */
    execute(context: AgentContext): Promise<string>;
    /**
     * Extract test failure information from context
     */
    private extractTestFailure;
}
//# sourceMappingURL=coder.d.ts.map