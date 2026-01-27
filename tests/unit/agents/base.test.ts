// tests/unit/agents/base.test.ts

import { BaseAgent } from '../../../src/agents/base';
import { LLMClient } from '../../../src/llm/client';

// Mock LLMClient
jest.mock('../../../src/llm/client');

describe('BaseAgent', () => {
  let mockLLMClient: jest.Mocked<LLMClient>;

  beforeEach(() => {
    mockLLMClient = new LLMClient() as jest.Mocked<LLMClient>;
  });

  describe('constructor', () => {
    it('should initialize with LLM client', () => {
      const agent = new TestAgent(mockLLMClient);
      expect(agent).toBeInstanceOf(BaseAgent);
    });

    it('should throw error if LLM client is not provided', () => {
      expect(() => new TestAgent(undefined as unknown as LLMClient)).toThrow();
    });
  });

  describe('execute (abstract method)', () => {
    it('should require subclasses to implement execute', () => {
      const agent = new TestAgent(mockLLMClient);
      expect(agent.execute).toBeDefined();
    });
  });

  describe('error handling', () => {
    it('should handle LLM errors gracefully', async () => {
      mockLLMClient.completeSystem.mockRejectedValue(
        new Error('LLM API error')
      );

      const agent = new TestAgent(mockLLMClient);

      await expect(
        agent.execute('test prompt')
      ).rejects.toThrow('Agent execution failed: LLM API error');
    });
  });
});

// Test implementation of BaseAgent
class TestAgent extends BaseAgent {
  async execute(input: string): Promise<string> {
    return this.callLLM(input);
  }

  getSystemPrompt(): string {
    return 'Test system prompt';
  }
}
