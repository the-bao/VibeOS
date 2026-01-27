// tests/unit/agents/specifier.test.ts

import { SpecifierAgent } from '../../../src/agents/specifier';
import { LLMClient } from '../../../src/llm/client';
import { VibeManifest } from '../../../src/core/types';

jest.mock('../../../src/llm/client');

describe('SpecifierAgent', () => {
  let agent: SpecifierAgent;
  let mockLLMClient: jest.Mocked<LLMClient>;

  beforeEach(() => {
    mockLLMClient = new LLMClient() as jest.Mocked<LLMClient>;
    agent = new SpecifierAgent(mockLLMClient);
  });

  const mockManifest: VibeManifest = {
    metadata: {
      name: 'test-component',
      version: '1.0.0',
    },
    spec: {
      intent: 'Create a login form',
      constraints: {
        framework: 'React',
        language: 'TypeScript',
        testing: ['jest', 'react-testing-library'],
      },
      visualSpec: {
        elements: ['email input', 'password input', 'submit button'],
      },
      functionalSpec: {
        states: ['email', 'password', 'loading', 'error'],
        behaviors: ['validate email', 'validate password', 'submit form'],
      },
    },
    status: {
      phase: 'Pending',
      currentLoop: 0,
    },
  };

  describe('execute', () => {
    it('should generate test file content', async () => {
      const expectedTests = `
describe('LoginForm', () => {
  it('should render email input', () => {});
  it('should render password input', () => {});
  it('should render submit button', () => {});
  it('should validate email format', () => {});
  it('should validate password length', () => {});
  it('should submit form with valid data', () => {});
});
`;

      mockLLMClient.completeSystem.mockResolvedValue({
        content: expectedTests,
        usage: { inputTokens: 100, outputTokens: 50 },
      });

      const result = await agent.execute(JSON.stringify(mockManifest));

      expect(result).toBe(expectedTests);
      expect(mockLLMClient.completeSystem).toHaveBeenCalledWith(
        expect.stringContaining('TDD-first'),
        expect.stringContaining('Create a login form')
      );
    });
  });

  describe('getSystemPrompt', () => {
    it('should return specifier system prompt', () => {
      const prompt = agent.getSystemPrompt();

      expect(prompt).toContain('TDD-first');
      expect(prompt).toContain('generate comprehensive test files');
      expect(prompt).toContain('BEFORE any implementation code exists');
    });
  });

  describe('error handling', () => {
    it('should handle invalid manifest JSON', async () => {
      await expect(agent.execute('invalid json')).rejects.toThrow();
    });

    it('should handle LLM errors', async () => {
      mockLLMClient.completeSystem.mockRejectedValue(
        new Error('API error')
      );

      await expect(
        agent.execute(JSON.stringify(mockManifest))
      ).rejects.toThrow('Agent execution failed');
    });
  });
});
