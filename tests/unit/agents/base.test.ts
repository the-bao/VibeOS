import { BaseAgent } from '../../../src/agents/base.js';
import { LLMClient } from '../../../src/llm/client.js';

// Mock LLMClient
jest.mock('../../../src/llm/client.js');

class TestAgent extends BaseAgent {
  async execute(_context: any): Promise<string> {
    return 'test result';
  }
}

describe('BaseAgent', () => {
  let mockLLMClient: jest.Mocked<LLMClient>;

  beforeEach(() => {
    mockLLMClient = new LLMClient('test-key') as jest.Mocked<LLMClient>;
  });

  it('should have a name', () => {
    const agent = new TestAgent('TestAgent', mockLLMClient);
    expect(agent.getName()).toBe('TestAgent');
  });

  it('should require execute implementation', () => {
    const agent = new TestAgent('TestAgent', mockLLMClient);
    expect(agent.execute({} as any)).resolves.toBeDefined();
  });
});
