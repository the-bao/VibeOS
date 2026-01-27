// src/llm/client.ts

import Anthropic from '@anthropic-ai/sdk';

export interface LLMMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface LLMResponse {
  content: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

export class LLMClient {
  private client: Anthropic;

  constructor(apiKey?: string) {
    this.client = new Anthropic({
      apiKey: apiKey || process.env.ANTHROPIC_API_KEY,
    });
  }

  async complete(
    messages: LLMMessage[],
    options?: { maxTokens?: number; model?: string; systemPrompt?: string }
  ): Promise<LLMResponse> {
    const response = await this.client.messages.create({
      model: options?.model || 'claude-3-5-sonnet-20241022',
      max_tokens: options?.maxTokens || 4096,
      system: options?.systemPrompt,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Anthropic API');
    }

    return {
      content: content.text,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
    };
  }

  async completeSystem(
    systemPrompt: string,
    userMessage: string,
    options?: { maxTokens?: number; model?: string }
  ): Promise<LLMResponse> {
    return this.complete(
      [{ role: 'user', content: userMessage }],
      { ...options, systemPrompt }
    );
  }
}
