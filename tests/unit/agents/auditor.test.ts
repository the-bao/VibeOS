// tests/unit/agents/auditor.test.ts

import { AuditorAgent } from '../../../src/agents/auditor';
import { LLMClient } from '../../../src/llm/client';
import { VibeManifest } from '../../../src/core/types';

jest.mock('../../../src/llm/client');

describe('AuditorAgent', () => {
  let agent: AuditorAgent;
  let mockLLMClient: jest.Mocked<LLMClient>;

  beforeEach(() => {
    mockLLMClient = new LLMClient() as jest.Mocked<LLMClient>;
    agent = new AuditorAgent(mockLLMClient);
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
      phase: 'Reconciling',
      currentLoop: 1,
    },
  };

  describe('execute', () => {
    it('should calculate diff from test results', async () => {
      const testResults = {
        passed: 5,
        failed: 3,
        total: 8,
        details: [
          { test: 'should render email input', status: 'passed' },
          { test: 'should render password input', status: 'passed' },
          { test: 'should render submit button', status: 'passed' },
          { test: 'should validate email format', status: 'passed' },
          { test: 'should validate password length', status: 'passed' },
          { test: 'should submit form with valid data', status: 'failed', error: 'submit function not found' },
          { test: 'should show loading state', status: 'failed', error: 'loading state not implemented' },
          { test: 'should show error message', status: 'failed', error: 'error handling missing' },
        ],
      };

      const mockAnalysis = {
        totalTests: 8,
        passedTests: 5,
        failedTests: 3,
        logicDiff: 3,
        visualDiff: 0,
        totalDiff: 3,
        recommendations: [
          'Implement submit function',
          'Add loading state handling',
          'Add error message display',
        ],
      };

      mockLLMClient.completeSystem.mockResolvedValue({
        content: JSON.stringify(mockAnalysis),
        usage: { inputTokens: 100, outputTokens: 50 },
      });

      const result = await agent.execute({
        manifest: mockManifest,
        currentCode: 'const LoginForm = () => <div>Login</div>;',
        loopNumber: 1,
      });

      const parsedResult = JSON.parse(result);

      expect(parsedResult.totalDiff).toBe(3);
      expect(parsedResult.logicDiff).toBe(3);
      expect(parsedResult.visualDiff).toBe(0);
      expect(parsedResult.failedTests).toBe(3);
      expect(mockLLMClient.completeSystem).toHaveBeenCalledWith(
        expect.stringContaining('Test Result Auditor'),
        expect.stringContaining('Calculate diff from test results')
      );
    });

    it('should return zero diff when all tests pass', async () => {
      const testResults = {
        passed: 5,
        failed: 0,
        total: 5,
        details: [
          { test: 'should render email input', status: 'passed' },
          { test: 'should render password input', status: 'passed' },
          { test: 'should render submit button', status: 'passed' },
          { test: 'should validate email format', status: 'passed' },
          { test: 'should validate password length', status: 'passed' },
        ],
      };

      const mockAnalysis = {
        totalTests: 5,
        passedTests: 5,
        failedTests: 0,
        logicDiff: 0,
        visualDiff: 0,
        totalDiff: 0,
        recommendations: [],
      };

      mockLLMClient.completeSystem.mockResolvedValue({
        content: JSON.stringify(mockAnalysis),
        usage: { inputTokens: 100, outputTokens: 50 },
      });

      const result = await agent.execute({
        manifest: mockManifest,
        currentCode: 'const LoginForm = () => <form><input/><button>Login</button></form>;',
        loopNumber: 2,
      });

      const parsedResult = JSON.parse(result);

      expect(parsedResult.totalDiff).toBe(0);
      expect(parsedResult.logicDiff).toBe(0);
      expect(parsedResult.visualDiff).toBe(0);
      expect(parsedResult.failedTests).toBe(0);
    });

    it('should detect visual diff from E2E test failures', async () => {
      const testResults = {
        passed: 3,
        failed: 2,
        total: 5,
        details: [
          { test: 'should render email input', status: 'passed' },
          { test: 'should render password input', status: 'passed' },
          { test: 'should render submit button', status: 'passed' },
          { test: 'E2E: should match visual spec', status: 'failed', error: 'Visual mismatch: button alignment off' },
          { test: 'E2E: should have correct colors', status: 'failed', error: 'Color mismatch: expected blue, got red' },
        ],
      };

      const mockAnalysis = {
        totalTests: 5,
        passedTests: 3,
        failedTests: 2,
        logicDiff: 0,
        visualDiff: 2,
        totalDiff: 2,
        recommendations: [
          'Fix button alignment',
          'Update button color to blue',
        ],
      };

      mockLLMClient.completeSystem.mockResolvedValue({
        content: JSON.stringify(mockAnalysis),
        usage: { inputTokens: 100, outputTokens: 50 },
      });

      const result = await agent.execute({
        manifest: mockManifest,
        currentCode: 'const LoginForm = () => <form><input/><button style={{color: "red"}}>Login</button></form>;',
        loopNumber: 3,
      });

      const parsedResult = JSON.parse(result);

      expect(parsedResult.totalDiff).toBe(2);
      expect(parsedResult.logicDiff).toBe(0);
      expect(parsedResult.visualDiff).toBe(2);
    });
  });

  describe('getSystemPrompt', () => {
    it('should return auditor system prompt', () => {
      const prompt = agent.getSystemPrompt();

      expect(prompt).toContain('Test Result Auditor');
      expect(prompt).toContain('Calculate diff from test results');
      expect(prompt).toContain('Logic Diff');
      expect(prompt).toContain('Visual Diff');
    });
  });

  describe('error handling', () => {
    it('should handle LLM errors', async () => {
      mockLLMClient.completeSystem.mockRejectedValue(
        new Error('API error')
      );

      await expect(
        agent.execute({
          manifest: mockManifest,
          currentCode: 'const LoginForm = () => <div>Login</div>;',
          loopNumber: 1,
        })
      ).rejects.toThrow('Agent execution failed');
    });

    it('should handle invalid JSON response', async () => {
      mockLLMClient.completeSystem.mockResolvedValue({
        content: 'invalid json response',
        usage: { inputTokens: 100, outputTokens: 50 },
      });

      await expect(
        agent.execute({
          manifest: mockManifest,
          currentCode: 'const LoginForm = () => <div>Login</div>;',
          loopNumber: 1,
        })
      ).rejects.toThrow();
    });
  });
});
