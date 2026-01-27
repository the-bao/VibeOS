// tests/unit/agents/coder.test.ts
import { CoderAgent } from '../../../src/agents/coder.js';
import { LLMClient } from '../../../src/llm/client.js';
import { VibeManifest, LoopResult } from '../../../src/core/types.js';
import { AgentContext } from '../../../src/agents/base.js';

jest.mock('../../../src/llm/client.js');

describe('CoderAgent', () => {
  let agent: CoderAgent;
  let mockLLMClient: jest.Mocked<LLMClient>;

  beforeEach(() => {
    mockLLMClient = new LLMClient('test-key') as jest.Mocked<LLMClient>;
    agent = new CoderAgent(mockLLMClient);
  });

  describe('execute', () => {
    it('should generate code to fix failing tests', async () => {
      const testFailure = `
FAIL  Button.test.js
  Button component
    × should render
      ReferenceError: Button is not defined

    × should handle click
      ReferenceError: onClick is not defined
      `;

      const manifest: VibeManifest = {
        metadata: { name: 'button', version: '1.0.0' },
        spec: {
          intent: 'A button component',
          constraints: {
            framework: 'React',
            language: 'TypeScript',
            testing: ['Jest'],
          },
          functionalSpec: {
            states: ['idle', 'clicked'],
            behaviors: ['renders button', 'handles click'],
          },
        },
        status: { phase: 'Reconciling', currentLoop: 1 },
      };

      const previousResults: LoopResult[] = [
        {
          loopNumber: 1,
          phase: 'auditor',
          success: false,
          diff: 2,
          output: testFailure,
          timestamp: new Date(),
        },
      ];

      const context: AgentContext = {
        manifest,
        currentCode: '// No code yet',
        loopNumber: 1,
        previousResults,
      };

      mockLLMClient.completeSystem.mockResolvedValue({
        content: 'export const Button = () => { return null; };',
        usage: { inputTokens: 200, outputTokens: 150 },
      });

      const result = await agent.execute(context);

      expect(result).toContain('export');
      expect(result).toContain('Button');
      expect(mockLLMClient.completeSystem).toHaveBeenCalledWith(
        expect.stringContaining('Coder Agent'),
        expect.stringContaining('Button component')
      );
    });

    it('should generate initial code when no previous results', async () => {
      const manifest: VibeManifest = {
        metadata: { name: 'button', version: '1.0.0' },
        spec: {
          intent: 'A button component',
          constraints: {
            framework: 'React',
            language: 'TypeScript',
            testing: ['Jest'],
          },
          functionalSpec: {
            states: ['idle'],
            behaviors: ['renders'],
          },
        },
        status: { phase: 'Reconciling', currentLoop: 1 },
      };

      const context: AgentContext = {
        manifest,
        currentCode: '',
        loopNumber: 1,
      };

      mockLLMClient.completeSystem.mockResolvedValue({
        content: 'export const Button = () => null;',
        usage: { inputTokens: 100, outputTokens: 50 },
      });

      const result = await agent.execute(context);

      expect(result).toContain('Button');
    });

    it('should handle LLM errors gracefully', async () => {
      const manifest: VibeManifest = {
        metadata: { name: 'test', version: '1.0.0' },
        spec: {
          intent: 'Test',
          constraints: {
            framework: 'React',
            language: 'TypeScript',
            testing: ['Jest'],
          },
          functionalSpec: {
            states: ['idle'],
            behaviors: ['test'],
          },
        },
        status: { phase: 'Reconciling', currentLoop: 1 },
      };

      const context: AgentContext = {
        manifest,
        currentCode: '',
        loopNumber: 1,
      };

      mockLLMClient.completeSystem.mockRejectedValue(
        new Error('API error')
      );

      await expect(agent.execute(context)).rejects.toThrow('Coder agent failed');
    });
  });

  describe('getName', () => {
    it('should return agent name', () => {
      expect(agent.getName()).toBe('CoderAgent');
    });
  });
});
