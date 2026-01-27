// src/agents/coder.ts

import { BaseAgent, AgentContext } from './base.js';
import { LLMClient } from '../llm/client.js';
import { CODER_SYSTEM_PROMPT, buildCoderPrompt } from '../llm/prompts.js';
import { VibeManifest } from '../core/types.js';

/**
 * CoderAgent generates implementation code to make tests pass
 * Analyzes test failures and generates minimal fixes
 */
export class CoderAgent extends BaseAgent {
  constructor(llmClient?: LLMClient) {
    super('CoderAgent', llmClient);
  }

  /**
   * Generate implementation code from test failures
   * @param context - Agent context containing manifest and test results
   * @returns Implementation code
   */
  async execute(context: AgentContext): Promise<string> {
    try {
      const { manifest, currentCode } = context;

      // Extract test failure from previous results if available
      const testFailure = this.extractTestFailure(context);

      if (!testFailure && context.previousResults && context.previousResults.length > 0) {
        throw new Error('No test failure information available');
      }

      // Build the prompt
      const userPrompt = buildCoderPrompt(
        JSON.stringify(manifest, null, 2),
        testFailure || 'No test failures - generate initial implementation',
        currentCode || '// No code exists yet'
      );

      // Call LLM to generate code
      const response = await this.callLLM(CODER_SYSTEM_PROMPT, userPrompt);

      return response;
    } catch (error) {
      throw new Error(`Coder agent failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Extract test failure information from context
   */
  private extractTestFailure(context: AgentContext): string {
    if (!context.previousResults || context.previousResults.length === 0) {
      return '';
    }

    // Find the most recent auditor result (which should have test output)
    const auditorResult = context.previousResults
      .filter(r => r.phase === 'auditor')
      .pop();

    if (auditorResult && auditorResult.output) {
      return auditorResult.output;
    }

    // If no auditor result, look for any error output
    const lastResult = context.previousResults[context.previousResults.length - 1];
    if (lastResult && lastResult.error) {
      return lastResult.error;
    }

    return '';
  }
}
