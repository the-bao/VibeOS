import { LLMClient } from '../llm/client.js';
import { VibeManifest, LoopResult } from '../core/types.js';

export interface AgentContext {
  manifest: VibeManifest;
  currentCode: string;
  loopNumber: number;
  previousResults?: LoopResult[];
}

export abstract class BaseAgent {
  protected llm: LLMClient;
  protected name: string;

  constructor(name: string, llm?: LLMClient) {
    this.name = name;
    this.llm = llm || new LLMClient();
  }

  abstract execute(context: AgentContext): Promise<string>;

  protected async callLLM(
    systemPrompt: string,
    userMessage: string
  ): Promise<string> {
    const response = await this.llm.completeSystem(systemPrompt, userMessage);
    return response.content;
  }

  getName(): string {
    return this.name;
  }
}
