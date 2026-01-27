import { BaseAgent, AgentContext } from './base.js';
import { SPECIFIER_SYSTEM_PROMPT, buildSpecifierPrompt } from '../llm/prompts.js';

export class SpecifierAgent extends BaseAgent {
  constructor() {
    super('Specifier');
  }

  async execute(context: AgentContext): Promise<string> {
    const { manifest, currentCode } = context;
    const manifestStr = JSON.stringify(manifest, null, 2);
    const userPrompt = buildSpecifierPrompt(manifestStr, currentCode);

    const testCode = await this.callLLM(SPECIFIER_SYSTEM_PROMPT, userPrompt);

    // Ensure TDD verification comment is present
    if (!testCode.includes('// TDD:')) {
      return `// TDD: This test MUST fail - no implementation exists yet\n${testCode}`;
    }

    return testCode;
  }
}
