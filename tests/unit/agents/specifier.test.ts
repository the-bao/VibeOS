import { SpecifierAgent } from '../../../src/agents/specifier.js';
import { VibeManifest } from '../../../src/core/types.js';
import { LLMClient } from '../../../src/llm/client.js';

// Mock LLMClient
jest.mock('../../../src/llm/client.js');

describe('SpecifierAgent', () => {
  let mockLLMClient: jest.Mocked<LLMClient>;

  beforeEach(() => {
    // Create a mock LLMClient
    mockLLMClient = {
      completeSystem: jest.fn().mockResolvedValue({
        content: `describe('TestComponent', () => {
  it('should render', () => {
    expect(true).toBe(true);
  });
})`,
        usage: { inputTokens: 100, outputTokens: 50 },
      }),
    } as any;

    // Mock the constructor to return our mock
    (LLMClient as jest.MockedClass<typeof LLMClient>).mockImplementation(
      () => mockLLMClient
    );
  });

  it('should generate test code for a simple component', async () => {
    const agent = new SpecifierAgent();
    const manifest: VibeManifest = {
      metadata: { name: 'test-component', version: '1.0.0' },
      spec: {
        intent: 'A simple button component',
        constraints: {
          framework: 'React',
          language: 'TypeScript',
          testing: ['Jest'],
        },
        functionalSpec: {
          states: ['idle', 'loading', 'disabled'],
          behaviors: ['renders button text', 'handles click'],
        },
      },
      status: { phase: 'Pending', currentLoop: 0 },
    };

    const context = {
      manifest,
      currentCode: '',
      loopNumber: 1,
    };

    const result = await agent.execute(context);

    expect(result).toContain('describe');
    expect(result).toContain('it(');
    expect(result).toContain('expect');
    expect(mockLLMClient.completeSystem).toHaveBeenCalled();
  });

  it('should include TDD verification comment', async () => {
    const agent = new SpecifierAgent();
    const manifest: VibeManifest = {
      metadata: { name: 'test-component', version: '1.0.0' },
      spec: {
        intent: 'A simple component',
        constraints: {
          framework: 'React',
          language: 'TypeScript',
          testing: ['Jest'],
        },
        functionalSpec: {
          states: ['ready'],
          behaviors: ['renders'],
        },
      },
      status: { phase: 'Pending', currentLoop: 0 },
    };

    const result = await agent.execute({
      manifest,
      currentCode: '',
      loopNumber: 1,
    });

    expect(result).toContain('// TDD: This test MUST fail');
  });

  it('should add TDD comment if LLM does not include it', async () => {
    const agent = new SpecifierAgent();
    const manifest: VibeManifest = {
      metadata: { name: 'test-component', version: '1.0.0' },
      spec: {
        intent: 'A simple component',
        constraints: {
          framework: 'React',
          language: 'TypeScript',
          testing: ['Jest'],
        },
        functionalSpec: {
          states: ['ready'],
          behaviors: ['renders'],
        },
      },
      status: { phase: 'Pending', currentLoop: 0 },
    };

    // Mock LLM response without TDD comment
    mockLLMClient.completeSystem.mockResolvedValueOnce({
      content: `describe('TestComponent', () => {
  it('should render', () => {
    expect(true).toBe(true);
  });
})`,
      usage: { inputTokens: 100, outputTokens: 50 },
    });

    const result = await agent.execute({
      manifest,
      currentCode: '',
      loopNumber: 1,
    });

    expect(result).toContain('// TDD: This test MUST fail - no implementation exists yet');
  });
});
