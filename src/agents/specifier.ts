// src/agents/specifier.ts

import { BaseAgent } from './base';
import { LLMClient } from '../llm/client';
import { VibeManifest } from '../core/types';

/**
 * Specifier Agent - TDD-first approach
 * Generates test files and probes BEFORE any code is written.
 * Tests must initially FAIL (Red phase of Red-Green-Refactor).
 */
export class SpecifierAgent extends BaseAgent {
  constructor(llmClient: LLMClient) {
    super(llmClient);
  }

  /**
   * Generate test files for the given manifest.
   */
  async execute(input: string): Promise<string> {
    let manifest: VibeManifest;

    try {
      manifest = JSON.parse(input);
    } catch (error) {
      throw new Error('Invalid manifest JSON');
    }

    const prompt = this.buildPrompt(manifest);
    return this.callLLM(prompt);
  }

  getSystemPrompt(): string {
    return `You are a TDD-first Test Generator.
Your role is to generate comprehensive test files BEFORE any implementation code exists.

Rules:
1. Generate tests based on the Vibe Manifest spec
2. Tests MUST initially FAIL (Red phase)
3. Cover all functional requirements and edge cases
4. Use the testing framework specified in constraints
5. Include unit tests, integration tests, and visual regression tests

Output format: Pure test code in the specified testing framework.`;
  }

  private buildPrompt(manifest: VibeManifest): string {
    const { intent, constraints, functionalSpec, visualSpec } = manifest.spec;

    let prompt = `Generate test files for the following component:

Intent: ${intent}

Framework: ${constraints.framework}
Language: ${constraints.language}
Testing Frameworks: ${constraints.testing.join(', ')}

Functional Requirements:
`;

    if (functionalSpec.inputs) {
      prompt += `Inputs: ${functionalSpec.inputs.join(', ')}\n`;
    }

    prompt += `States: ${functionalSpec.states.join(', ')}
Behaviors: ${functionalSpec.behaviors.join(', ')}
`;

    if (visualSpec) {
      prompt += `Visual Elements: ${visualSpec.elements.join(', ')}\n`;
    }

    return prompt;
  }
}
