// src/agents/auditor.ts

import { BaseAgent, AgentContext } from './base';
import { LLMClient } from '../llm/client';
import { VibeManifest } from '../core/types';

/**
 * Auditor Agent - Test result verification and diff calculation
 * Runs tests and calculates the difference between current and desired state.
 *
 * Logic Diff: Number of unit test failures
 * Visual Diff: Number of E2E test failures
 * Total Diff = Logic Diff + Visual Diff
 */
export class AuditorAgent extends BaseAgent {
  constructor(llmClient: LLMClient) {
    super('AuditorAgent', llmClient);
  }

  /**
   * Analyze test results and calculate diff.
   */
  async execute(context: AgentContext): Promise<string> {
    const { manifest, currentCode, loopNumber } = context;

    const prompt = this.buildPrompt(manifest, currentCode, loopNumber);

    try {
      const response = await this.callLLM(this.getSystemPrompt(), prompt);

      // Validate and parse the response
      try {
        const result = JSON.parse(response);
        return JSON.stringify(result);
      } catch (error) {
        throw new Error(`Failed to parse LLM response as JSON: ${error}`);
      }
    } catch (error) {
      throw new Error(`Agent execution failed: ${error}`);
    }
  }

  getSystemPrompt(): string {
    return `You are a Test Result Auditor.
Your role is to Calculate diff from test results and analyze the difference between current and desired state.

Rules:
1. Calculate Logic Diff: Count of unit test failures
2. Calculate Visual Diff: Count of E2E test failures
3. Calculate Total Diff = Logic Diff + Visual Diff
4. Provide recommendations for fixing failing tests
5. Return results in JSON format

Output format (JSON):
{
  "totalTests": number,
  "passedTests": number,
  "failedTests": number,
  "logicDiff": number,
  "visualDiff": number,
  "totalDiff": number,
  "recommendations": string[]
}

The totalDiff represents how far the current implementation is from the desired state.
A diff of 0 means all tests pass and the system is in the desired state.`;
  }

  private buildPrompt(
    manifest: VibeManifest,
    currentCode: string,
    loopNumber: number
  ): string {
    const { intent, functionalSpec, visualSpec } = manifest.spec;

    return `Analyze test results for the following component:

Component: ${manifest.metadata.name}
Loop Number: ${loopNumber}
Intent: ${intent}

Current Implementation:
\`\`\`
${currentCode}
\`\`\`

Functional Requirements:
States: ${functionalSpec.states.join(', ')}
Behaviors: ${functionalSpec.behaviors.join(', ')}

${visualSpec ? `Visual Elements: ${visualSpec.elements.join(', ')}` : ''}

Please Calculate diff from test results and provide recommendations.
Return your analysis as a JSON object with the following structure:
{
  "totalTests": number,
  "passedTests": number,
  "failedTests": number,
  "logicDiff": number,
  "visualDiff": number,
  "totalDiff": number,
  "recommendations": string[]
}`;
  }
}
