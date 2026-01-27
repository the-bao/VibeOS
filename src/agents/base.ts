// src/agents/base.ts

import { LLMClient } from '../llm/client';

/**
 * Base class for all AI agents in the VibeOS system.
 * Provides common functionality for LLM interaction and error handling.
 */
export abstract class BaseAgent {
  protected llm: LLMClient;

  constructor(llmClient: LLMClient) {
    if (!llmClient) {
      throw new Error('LLM client is required');
    }
    this.llm = llmClient;
  }

  /**
   * Execute the agent's primary task.
   * Must be implemented by subclasses.
   */
  abstract execute(input: string): Promise<string>;

  /**
   * Get the system prompt for this agent.
   * Must be implemented by subclasses.
   */
  abstract getSystemPrompt(): string;

  /**
   * Call the LLM with the given prompt.
   * Uses the agent's system prompt.
   */
  protected async callLLM(userPrompt: string): Promise<string> {
    const systemPrompt = this.getSystemPrompt();

    try {
      const response = await this.llm.completeSystem(systemPrompt, userPrompt);
      return response.content;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Agent execution failed: ${error.message}`);
      }
      throw new Error('Agent execution failed with unknown error');
    }
  }
}
