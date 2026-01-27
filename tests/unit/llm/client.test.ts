// tests/unit/llm/client.test.ts

import { LLMClient } from '../../../src/llm/client';

describe('LLMClient', () => {
  it('should initialize with API key from environment', () => {
    const client = new LLMClient();
    expect(client).toBeDefined();
  });

  it('should initialize with explicit API key', () => {
    const client = new LLMClient('test-key');
    expect(client).toBeDefined();
  });
});
