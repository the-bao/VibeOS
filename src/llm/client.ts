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

/**
 * Content block types from Anthropic API.
 * Currently only text responses are supported.
 * Tool use blocks (type: 'tool_use') are not handled in the MVP.
 */
type ContentBlock = Anthropic.ContentBlock;

export class LLMClient {
  private client: Anthropic;

  constructor(apiKey?: string) {
    const key = apiKey || process.env.ANTHROPIC_API_KEY;
    if (!key) {
      throw new Error('API key is required. Provide it as argument or set ANTHROPIC_API_KEY environment variable.');
    }
    this.client = new Anthropic({
      apiKey: key,
      timeout: 60 * 1000, // 60 seconds default timeout
    });
  }

  async complete(
    messages: LLMMessage[],
    options?: { maxTokens?: number; model?: string; systemPrompt?: string }
  ): Promise<LLMResponse> {
    try {
      const response = await this.client.messages.create({
        model: options?.model || 'claude-3-5-sonnet-20241022',
        max_tokens: options?.maxTokens || 4096,
        system: options?.systemPrompt,
        messages: messages.map(m => ({
          role: m.role,
          content: m.content,
        })),
      });

      // Check if response content array is not empty
      if (!response.content || response.content.length === 0) {
        throw new Error('Empty response content from Anthropic API');
      }

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Anthropic API. Only text responses are supported.');
      }

      return {
        content: content.text,
        usage: {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
        },
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`LLM API request failed: ${error.message}`);
      }
      throw new Error('LLM API request failed with unknown error');
    }
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
