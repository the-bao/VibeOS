// tests/unit/llm/client.test.ts

import { LLMClient } from '../../../src/llm/client';

describe('LLMClient', () => {
  describe('constructor', () => {
    const originalEnv = process.env.ANTHROPIC_API_KEY;

    afterEach(() => {
      process.env.ANTHROPIC_API_KEY = originalEnv;
    });

    it('should initialize with explicit API key', () => {
      const client = new LLMClient('test-key');
      expect(client).toBeDefined();
    });

    it('should initialize with API key from environment', () => {
      process.env.ANTHROPIC_API_KEY = 'env-key';
      const client = new LLMClient();
      expect(client).toBeDefined();
    });

    it('should throw error when no API key is provided', () => {
      delete process.env.ANTHROPIC_API_KEY;
      expect(() => new LLMClient()).toThrow('API key is required');
    });

    it('should throw error with explicit undefined key and no env var', () => {
      delete process.env.ANTHROPIC_API_KEY;
      expect(() => new LLMClient(undefined)).toThrow('API key is required');
    });
  });
});
