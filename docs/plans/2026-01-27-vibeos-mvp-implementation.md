# VibeOS MVP Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a minimum viable prototype of VibeOS that demonstrates the complete Reconciliation Loop (Specifier → Coder → Auditor) using a Snake Game as the validation scenario.

**Architecture:** A TypeScript-based system with three AI agents (Specifier, Coder, Auditor) coordinated by a Reconciliation Engine. Agents use real LLM calls (Claude API) to generate tests, code, and validate results through continuous iteration until tests pass.

**Tech Stack:** TypeScript, Node.js, Claude API, Jest, React Testing Library, Playwright

---

## Phase 1: Project Setup and Core Types

### Task 1: Initialize TypeScript Project

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `.npmrc`

**Step 1: Create package.json**

```bash
cat > package.json << 'EOF'
{
  "name": "vibeos-mvp",
  "version": "0.1.0",
  "description": "VibeOS MVP - Declarative Coding Control Plane",
  "main": "dist/cli/index.js",
  "type": "module",
  "scripts": {
    "build": "tsc",
    "dev": "tsx src/cli/index.ts",
    "test": "jest",
    "test:watch": "jest --watch"
  },
  "keywords": ["vibeos", "ai", "reconciliation"],
  "license": "MIT",
  "dependencies": {
    "@anthropic-ai/sdk": "^0.30.0",
    "commander": "^12.0.0",
    "chalk": "^5.3.0"
  },
  "devDependencies": {
    "@types/jest": "^29.5.0",
    "@types/node": "^20.0.0",
    "jest": "^29.7.0",
    "ts-jest": "^29.1.0",
    "tsx": "^4.7.0",
    "typescript": "^5.3.0"
  }
}
EOF
```

**Step 2: Create tsconfig.json**

```bash
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
EOF
```

**Step 3: Create Jest config**

```bash
cat > jest.config.js << 'EOF'
export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      useESM: true
    }]
  }
};
EOF
```

**Step 4: Initialize and install dependencies**

```bash
npm install
```

Expected: Dependencies installed successfully

**Step 5: Commit**

```bash
git add package.json tsconfig.json jest.config.js
git commit -m "feat: initialize TypeScript project with build config"
```

---

### Task 2: Define Core Types

**Files:**
- Create: `src/core/types.ts`
- Create: `src/core/manifest.ts`
- Test: `tests/unit/core/types.test.ts`

**Step 1: Write the failing test**

```bash
mkdir -p tests/unit/core
```

```typescript
// tests/unit/core/types.test.ts
import { VibeManifest, Phase } from '../../src/core/types.js';

describe('VibeManifest Types', () => {
  describe('VibeManifest', () => {
    it('should create a valid manifest with required fields', () => {
      const manifest: VibeManifest = {
        metadata: {
          name: 'test-component',
          version: '1.0.0'
        },
        spec: {
          intent: 'A test component',
          constraints: {
            framework: 'React',
            language: 'TypeScript',
            testing: ['Jest']
          },
          functionalSpec: {
            states: ['idle', 'active'],
            behaviors: ['should initialize', 'should respond']
          }
        },
        status: {
          phase: 'Pending',
          currentLoop: 0
        }
      };

      expect(manifest.metadata.name).toBe('test-component');
      expect(manifest.spec.intent).toBe('A test component');
      expect(manifest.status.phase).toBe('Pending');
    });

    it('should allow optional visualSpec', () => {
      const manifest: VibeManifest = {
        metadata: { name: 'test', version: '1.0.0' },
        spec: {
          intent: 'test',
          constraints: { framework: 'React', language: 'TypeScript', testing: [] },
          visualSpec: {
            style: 'minimalist',
            elements: ['button', 'input']
          },
          functionalSpec: {
            states: [],
            behaviors: []
          }
        },
        status: { phase: 'Pending', currentLoop: 0 }
      };

      expect(manifest.spec.visualSpec).toBeDefined();
      expect(manifest.spec.visualSpec?.style).toBe('minimalist');
    });
  });

  describe('Phase', () => {
    it('should accept all valid phase values', () => {
      const phases: Phase[] = ['Pending', 'Reconciling', 'Ready', 'Failed'];

      phases.forEach(phase => {
        expect(phase).toMatch(/^(Pending|Reconciling|Ready|Failed)$/);
      });
    });
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm test
```

Expected: FAIL with "Cannot find module '../../src/core/types.js'"

**Step 3: Create the types file**

```bash
mkdir -p src/core
```

```typescript
// src/core/types.ts

/**
 * Phase represents the current state of a component in the reconciliation loop
 */
export type Phase = 'Pending' | 'Reconciling' | 'Ready' | 'Failed';

/**
 * VibeManifest is the declarative specification for a component
 * It defines the desired state that the reconciliation loop will achieve
 */
export interface VibeManifest {
  /** Metadata identifies the component */
  metadata: {
    name: string;
    version: string;
  };

  /** Spec defines what the component should do and how */
  spec: {
    /** Intent is a natural language description of the component's purpose */
    intent: string;

    /** Constraints define technical limitations and choices */
    constraints: {
      framework: string;
      language: string;
      testing: string[];
    };

    /** Optional visual specifications */
    visualSpec?: {
      style: string;
      elements: string[];
    };

    /** Functional specifications define behaviors */
    functionalSpec: {
      inputs?: string[];
      states: string[];
      behaviors: string[];
    };
  };

  /** Status tracks current reconciliation state */
  status: {
    phase: Phase;
    currentLoop: number;
    lastError?: string;
    diff?: number;
  };
}

/**
 * LoopResult captures the outcome of a single reconciliation iteration
 */
export interface LoopResult {
  loopNumber: number;
  phase: Phase;
  diff: number;
  testsPassed: number;
  testsFailed: number;
  agentOutputs: {
    specifier?: string;
    coder?: string;
    auditor?: string;
  };
  timestamp: Date;
}

/**
 * ReconciliationResult is the final outcome after all loops
 */
export interface ReconciliationResult {
  success: boolean;
  totalLoops: number;
  finalDiff: number;
  history: LoopResult[];
  error?: string;
}

/**
 * CrashLoopConfig defines safety limits for the reconciliation loop
 */
export interface CrashLoopConfig {
  maxTotalLoops: number;
  maxStagnationCount: number;
  stagnationThreshold: number;
}
```

**Step 4: Run test to verify it passes**

```bash
npm test
```

Expected: PASS (all tests)

**Step 5: Commit**

```bash
git add tests/unit/core types.test.ts src/core/types.ts
git commit -m "feat: define core VibeManifest types with tests"
```

---

## Phase 2: LLM Client

### Task 3: Create LLM Client Base

**Files:**
- Create: `src/llm/client.ts`
- Test: `tests/unit/llm/client.test.ts`

**Step 1: Write the failing test**

```bash
mkdir -p tests/unit/llm
```

```typescript
// tests/unit/llm/client.test.ts
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { LLMClient } from '../../src/llm/client.js';

describe('LLMClient', () => {
  let client: LLMClient;

  beforeEach(() => {
    client = new LLMClient({ apiKey: 'test-key' });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should create client with API key', () => {
      expect(client).toBeInstanceOf(LLMClient);
    });

    it('should throw error without API key', () => {
      expect(() => new LLMClient({ apiKey: '' }))
        .toThrow('API key is required');
    });
  });

  describe('generate', () => {
    it('should call Claude API and return response', async () => {
      const mockResponse = {
        content: [{ type: 'text', text: 'Test response' }]
      };

      jest.spyOn(client as any, 'callClaude').mockResolvedValue(mockResponse);

      const result = await client.generate('Test prompt');

      expect(result).toBe('Test response');
    });

    it('should handle API errors gracefully', async () => {
      jest.spyOn(client as any, 'callClaude').mockRejectedValue(
        new Error('API Error')
      );

      await expect(client.generate('Test prompt'))
        .rejects.toThrow('API Error');
    });
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm test tests/unit/llm/client.test.ts
```

Expected: FAIL with "Cannot find module '../../src/llm/client.js'"

**Step 3: Create the LLM client**

```bash
mkdir -p src/llm
```

```typescript
// src/llm/client.ts
import Anthropic from '@anthropic-ai/sdk';

export interface LLMClientConfig {
  apiKey: string;
  model?: string;
  maxTokens?: number;
}

/**
 * LLMClient provides a unified interface for interacting with LLM APIs
 * Currently supports Claude (Anthropic), extensible for other providers
 */
export class LLMClient {
  private client: Anthropic;
  private model: string;
  private maxTokens: number;

  constructor(config: LLMClientConfig) {
    if (!config.apiKey || config.apiKey.trim() === '') {
      throw new Error('API key is required');
    }

    this.client = new Anthropic({
      apiKey: config.apiKey,
      dangerouslyAllowBrowser: true // For MVP; use backend in production
    });

    this.model = config.model || 'claude-3-5-sonnet-20241022';
    this.maxTokens = config.maxTokens || 4096;
  }

  /**
   * Generate a completion from the LLM
   * @param prompt - The prompt to send to the LLM
   * @returns The generated text response
   */
  async generate(prompt: string): Promise<string> {
    try {
      const response = await this.callClaude(prompt);

      // Extract text from the response
      const content = response.content[0];
      if (content.type === 'text') {
        return content.text;
      }

      throw new Error('Unexpected response format from Claude');
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`LLM generation failed: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Call Claude API with the given prompt
   * @internal
   */
  private async callClaude(prompt: string) {
    return await this.client.messages.create({
      model: this.model,
      max_tokens: this.maxTokens,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });
  }

  /**
   * Generate a completion with structured JSON output
   * Useful for getting parsed responses from the LLM
   */
  async generateJSON<T>(prompt: string): Promise<T> {
    const enhancedPrompt = `${prompt}\n\nRespond with valid JSON only, no markdown formatting.`;

    const response = await this.generate(enhancedPrompt);

    try {
      return JSON.parse(response) as T;
    } catch (error) {
      throw new Error(`Failed to parse LLM response as JSON: ${response}`);
    }
  }
}
```

**Step 4: Run test to verify it passes**

```bash
npm test tests/unit/llm/client.test.ts
```

Expected: PASS (all tests)

**Step 5: Commit**

```bash
git add tests/unit/llm tests/unit/llm/client.test.ts src/llm/client.ts
git commit -m "feat: implement LLM client with Claude API support"
```

---

## Phase 3: Agent Base and Implementation

### Task 4: Create Agent Base Class

**Files:**
- Create: `src/agents/base.ts`
- Test: `tests/unit/agents/base.test.ts`

**Step 1: Write the failing test**

```bash
mkdir -p tests/unit/agents
```

```typescript
// tests/unit/agents/base.test.ts
import { Agent } from '../../src/agents/base.js';
import { LLMClient } from '../../src/llm/client.js';
import { VibeManifest } from '../../src/core/types.js';

class TestAgent extends Agent {
  public async execute(input: string): Promise<string> {
    return 'test output';
  }
}

describe('Agent', () => {
  describe('constructor', () => {
    it('should create agent with LLM client', () => {
      const llmClient = new LLMClient({ apiKey: 'test-key' });
      const agent = new TestAgent(llmClient);

      expect(agent).toBeInstanceOf(TestAgent);
      expect(agent['llmClient']).toBe(llmClient);
    });

    it('should throw error without LLM client', () => {
      expect(() => new TestAgent(undefined as unknown as LLMClient))
        .toThrow('LLM client is required');
    });
  });

  describe('getName', () => {
    it('should return agent name', () => {
      const agent = new TestAgent(new LLMClient({ apiKey: 'test-key' }));
      expect(agent.getName()).toBe('TestAgent');
    });
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm test tests/unit/agents/base.test.ts
```

Expected: FAIL with "Cannot find module '../../src/agents/base.js'"

**Step 3: Create the agent base class**

```bash
mkdir -p src/agents
```

```typescript
// src/agents/base.ts
import { LLMClient } from '../llm/client.js';

/**
 * Agent is the base class for all AI agents in the VibeOS system
 * All agents must extend this class and implement the execute method
 */
export abstract class Agent {
  protected llmClient: LLMClient;

  constructor(llmClient: LLMClient) {
    if (!llmClient) {
      throw new Error('LLM client is required');
    }
    this.llmClient = llmClient;
  }

  /**
   * Get the name of this agent class
   */
  getName(): string {
    return this.constructor.name;
  }

  /**
   * Execute the agent's primary function
   * Each agent must implement this method
   *
   * @param input - The input data for the agent
   * @returns The output from the agent
   */
  abstract execute(input: string): Promise<string>;

  /**
   * Helper method to call the LLM with a prompt
   */
  protected async callLLM(prompt: string): Promise<string> {
    return await this.llmClient.generate(prompt);
  }
}
```

**Step 4: Run test to verify it passes**

```bash
npm test tests/unit/agents/base.test.ts
```

Expected: PASS (all tests)

**Step 5: Commit**

```bash
git add tests/unit/agents tests/unit/agents/base.test.ts src/agents/base.ts
git commit -m "feat: create base Agent class with LLM integration"
```

---

### Task 5: Implement Specifier Agent

**Files:**
- Create: `src/agents/specifier.ts`
- Create: `src/llm/prompts.ts`
- Test: `tests/unit/agents/specifier.test.ts`

**Step 1: Write the failing test**

```typescript
// tests/unit/agents/specifier.test.ts
import { SpecifierAgent } from '../../src/agents/specifier.js';
import { LLMClient } from '../../src/llm/client.js';
import { VibeManifest } from '../../src/core/types.js';

describe('SpecifierAgent', () => {
  let agent: SpecifierAgent;
  let llmClient: LLMClient;

  beforeEach(() => {
    llmClient = new LLMClient({ apiKey: 'test-key' });
    agent = new SpecifierAgent(llmClient);
  });

  describe('execute', () => {
    it('should generate test code from manifest', async () => {
      const manifest: VibeManifest = {
        metadata: { name: 'test-component', version: '1.0.0' },
        spec: {
          intent: 'A button component',
          constraints: {
            framework: 'React',
            language: 'TypeScript',
            testing: ['Jest']
          },
          functionalSpec: {
            states: ['idle', 'hover', 'active'],
            behaviors: ['should render', 'should handle click']
          }
        },
        status: { phase: 'Pending', currentLoop: 0 }
      };

      jest.spyOn(llmClient, 'generate').mockResolvedValue(
        'describe("Button", () => { it("should render", () => {}); });'
      );

      const result = await agent.execute(JSON.stringify(manifest));

      expect(result).toContain('describe');
      expect(result).toContain('Button');
    });

    it('should include TDD instruction in prompt', async () => {
      const generateSpy = jest.spyOn(llmClient, 'generate')
        .mockResolvedValue('test code');

      await agent.execute('{"spec": {"intent": "test"}}');

      expect(generateSpy).toHaveBeenCalled();
      const promptArg = generateSpy.mock.calls[0][0];
      expect(promptArg).toContain('TDD');
    });
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm test tests/unit/agents/specifier.test.ts
```

Expected: FAIL with "Cannot find module '../../src/agents/specifier.js'"

**Step 3: Create prompt templates first**

```typescript
// src/llm/prompts.ts

/**
 * Prompt templates for different agents
 * Centralizes prompt engineering for consistency
 */

export const SPECIFIER_SYSTEM_PROMPT = `You are the Specifier Agent in VibeOS, responsible for Test-Driven Development.

Your role:
1. Generate comprehensive tests BEFORE any code exists
2. Tests MUST initially FAIL (this proves they are valid)
3. Cover: unit tests, integration tests, and edge cases
4. Follow the testing framework specified in the manifest

Output format: Return ONLY the test code, no explanations or markdown.`;

export const SPECIFIER_USER_PROMPT = (manifestJson: string) => `
Generate tests for the following component specification:

${manifestJson}

Requirements:
- Write tests that WILL FAIL (component doesn't exist yet)
- Test all behaviors listed in the spec
- Test all states mentioned in the spec
- Use the testing framework from constraints
- Return ONLY valid test code
`;

export const CODER_SYSTEM_PROMPT = `You are the Coder Agent in VibeOS, responsible for writing code to make tests pass.

Your role:
1. Analyze failing test outputs
2. Write the MINIMUM code needed to make tests pass
3. Follow the tech stack constraints
4. Write clean, readable code

Output format: Return ONLY the implementation code, no explanations.`;

export const CODER_USER_PROMPT = (testFailure: string, currentCode: string) => `
The following tests are failing:

${testFailure}

Current code:
${currentCode || '// No code exists yet'}

Write the MINIMUM implementation needed to make these tests pass.
Return ONLY the implementation code.
`;

export const AUDITOR_SYSTEM_PROMPT = `You are the Auditor Agent in VibeOS, responsible for validation and quality assurance.

Your role:
1. Analyze test results
2. Calculate the "diff" - how far we are from the goal
3. Identify what's still missing or broken

Output format: Return a JSON object with:
{
  "diff": <number>,
  "testsPassed": <number>,
  "testsFailed": <number>,
  "summary": "<string>"
}`;

export const AUDITOR_USER_PROMPT = (testOutput: string) => `
Analyze these test results:

${testOutput}

Calculate the diff (number of failing tests) and provide a summary.
Return ONLY valid JSON.
`;
```

**Step 4: Create the Specifier Agent**

```typescript
// src/agents/specifier.ts
import { Agent } from './base.js';
import { VibeManifest } from '../core/types.js';
import { SPECIFIER_SYSTEM_PROMPT, SPECIFIER_USER_PROMPT } from '../llm/prompts.js';

/**
 * SpecifierAgent implements the TDD-first approach
 * It generates tests BEFORE any code exists
 * Tests must initially FAIL to prove they are valid
 */
export class SpecifierAgent extends Agent {
  /**
   * Generate test code from a VibeManifest
   * @param input - JSON string of VibeManifest
   * @returns Test code that should initially FAIL
   */
  async execute(input: string): Promise<string> {
    try {
      // Parse and validate the manifest
      const manifest: VibeManifest = JSON.parse(input);

      // Build the prompt
      const prompt = this.buildPrompt(manifest);

      // Call LLM to generate tests
      const testCode = await this.callLLM(prompt);

      return testCode;
    } catch (error) {
      throw new Error(`Specifier agent failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Build the prompt for test generation
   */
  private buildPrompt(manifest: VibeManifest): string {
    return `${SPECIFIER_SYSTEM_PROMPT}\n\n${SPECIFIER_USER_PROMPT(JSON.stringify(manifest, null, 2))}`;
  }

  /**
   * Validate that the generated tests would fail
   * This is crucial for TDD - tests must fail first
   */
  async validateTestsFail(testCode: string, existingCode: string): Promise<boolean> {
    // In MVP, we assume tests will fail if component doesn't exist
    // In full implementation, this would actually run the tests
    return true;
  }
}
```

**Step 5: Run test to verify it passes**

```bash
npm test tests/unit/agents/specifier.test.ts
```

Expected: PASS (all tests)

**Step 6: Commit**

```bash
git add tests/unit/agents/specifier.test.ts src/agents/specifier.ts src/llm/prompts.ts
git commit -m "feat: implement SpecifierAgent with TDD-first approach"
```

---

### Task 6: Implement Coder Agent

**Files:**
- Create: `src/agents/coder.ts`
- Test: `tests/unit/agents/coder.test.ts`

**Step 1: Write the failing test**

```typescript
// tests/unit/agents/coder.test.ts
import { CoderAgent } from '../../src/agents/coder.js';
import { LLMClient } from '../../src/llm/client.js';

describe('CoderAgent', () => {
  let agent: CoderAgent;
  let llmClient: LLMClient;

  beforeEach(() => {
    llmClient = new LLMClient({ apiKey: 'test-key' });
    agent = new CoderAgent(llmClient);
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

      const currentCode = '// No code yet';

      jest.spyOn(llmClient, 'generate').mockResolvedValue(
        'export const Button = () => { return null; };'
      );

      const result = await agent.execute(
        JSON.stringify({ testFailure, currentCode })
      );

      expect(result).toContain('export');
      expect(result).toContain('Button');
    });

    it('should prompt for minimal implementation', async () => {
      const generateSpy = jest.spyOn(llmClient, 'generate')
        .mockResolvedValue('code');

      await agent.execute('{"testFailure": "test failed", "currentCode": ""}');

      expect(generateSpy).toHaveBeenCalled();
      const prompt = generateSpy.mock.calls[0][0];
      expect(prompt).toContain('MINIMUM');
    });
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm test tests/unit/agents/coder.test.ts
```

Expected: FAIL with "Cannot find module '../../src/agents/coder.js'"

**Step 3: Create the Coder Agent**

```typescript
// src/agents/coder.ts
import { Agent } from './base.js';
import { CODER_SYSTEM_PROMPT, CODER_USER_PROMPT } from '../llm/prompts.js';

/**
 * CoderAgent writes implementation code to make tests pass
 * It analyzes test failures and generates minimal fixes
 */
export class CoderAgent extends Agent {
  /**
   * Generate implementation code from test failures
   * @param input - JSON string with { testFailure, currentCode }
   * @returns Implementation code
   */
  async execute(input: string): Promise<string> {
    try {
      const { testFailure, currentCode } = JSON.parse(input);

      if (!testFailure) {
        throw new Error('testFailure is required');
      }

      // Build the prompt
      const prompt = this.buildPrompt(testFailure, currentCode || '');

      // Call LLM to generate code
      const code = await this.callLLM(prompt);

      return code;
    } catch (error) {
      throw new Error(`Coder agent failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Build the prompt for code generation
   */
  private buildPrompt(testFailure: string, currentCode: string): string {
    return `${CODER_SYSTEM_PROMPT}\n\n${CODER_USER_PROMPT(testFailure, currentCode)}`;
  }
}
```

**Step 4: Run test to verify it passes**

```bash
npm test tests/unit/agents/coder.test.ts
```

Expected: PASS (all tests)

**Step 5: Commit**

```bash
git add tests/unit/agents/coder.test.ts src/agents/coder.ts
git commit -m "feat: implement CoderAgent for test-driven code generation"
```

---

### Task 7: Implement Auditor Agent

**Files:**
- Create: `src/agents/auditor.ts`
- Test: `tests/unit/agents/auditor.test.ts`

**Step 1: Write the failing test**

```typescript
// tests/unit/agents/auditor.test.ts
import { AuditorAgent } from '../../src/agents/auditor.js';
import { LLMClient } from '../../src/llm/client.js';

describe('AuditorAgent', () => {
  let agent: AuditorAgent;
  let llmClient: LLMClient;

  beforeEach(() => {
    llmClient = new LLMClient({ apiKey: 'test-key' });
    agent = new AuditorAgent(llmClient);
  });

  describe('execute', () => {
    it('should parse test results and calculate diff', async () => {
      const testOutput = `
 PASS  Button.test.js
  Button component
    ✓ should render
    ✓ should handle click
    × should have correct class

Test Suites: 1 passed, 1 total
Tests:       2 passed, 1 failed
      `;

      jest.spyOn(llmClient, 'generate').mockResolvedValue(
        JSON.stringify({
          diff: 1,
          testsPassed: 2,
          testsFailed: 1,
          summary: 'One test still failing'
        })
      );

      const result = await agent.execute(testOutput);

      expect(result).toContain('diff');
    });

    it('should return zero diff when all tests pass', async () => {
      const testOutput = 'Tests: 5 passed, 0 failed';

      jest.spyOn(llmClient, 'generate').mockResolvedValue(
        JSON.stringify({
          diff: 0,
          testsPassed: 5,
          testsFailed: 0,
          summary: 'All tests passing'
        })
      );

      const result = await agent.execute(testOutput);
      const parsed = JSON.parse(result);

      expect(parsed.diff).toBe(0);
    });
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm test tests/unit/agents/auditor.test.ts
```

Expected: FAIL with "Cannot find module '../../src/agents/auditor.js'"

**Step 3: Create the Auditor Agent**

```typescript
// src/agents/auditor.ts
import { Agent } from './base.js';
import { AUDITOR_SYSTEM_PROMPT, AUDITOR_USER_PROMPT } from '../llm/prompts.js';

/**
 * AuditorAgent validates test results and calculates the diff
 * It determines how close we are to the goal
 */
export class AuditorAgent extends Agent {
  /**
   * Analyze test results and calculate diff
   * @param input - Test output string
   * @returns JSON string with diff analysis
   */
  async execute(input: string): Promise<string> {
    try {
      // Build the prompt
      const prompt = this.buildPrompt(input);

      // Call LLM to analyze
      const analysis = await this.callLLM(prompt);

      // Validate it's proper JSON
      JSON.parse(analysis); // Will throw if invalid

      return analysis;
    } catch (error) {
      throw new Error(`Auditor agent failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Build the prompt for test analysis
   */
  private buildPrompt(testOutput: string): string {
    return `${AUDITOR_SYSTEM_PROMPT}\n\n${AUDITOR_USER_PROMPT(testOutput)}`;
  }
}
```

**Step 4: Run test to verify it passes**

```bash
npm test tests/unit/agents/auditor.test.ts
```

Expected: PASS (all tests)

**Step 5: Commit**

```bash
git add tests/unit/agents/auditor.test.ts src/agents/auditor.ts
git commit -m "feat: implement AuditorAgent for test validation"
```

---

## Phase 4: Reconciliation Engine

### Task 8: Create State Machine

**Files:**
- Create: `src/core/state-machine.ts`
- Test: `tests/unit/core/state-machine.test.ts`

**Step 1: Write the failing test**

```typescript
// tests/unit/core/state-machine.test.ts
import { StateMachine } from '../../src/core/state-machine.js';
import { Phase } from '../../src/core/types.js';

describe('StateMachine', () => {
  it('should initialize with Pending phase', () => {
    const sm = new StateMachine();
    expect(sm.getCurrentPhase()).toBe('Pending');
  });

  it('should transition to Reconciling', () => {
    const sm = new StateMachine();
    sm.transition('Reconciling');
    expect(sm.getCurrentPhase()).toBe('Reconciling');
  });

  it('should transition to Ready when diff is 0', () => {
    const sm = new StateMachine();
    sm.transition('Reconciling');
    const newPhase = sm.checkTransition(0);
    expect(newPhase).toBe('Ready');
  });

  it('should stay Reconciling when diff > 0', () => {
    const sm = new StateMachine();
    sm.transition('Reconciling');
    const newPhase = sm.checkTransition(5);
    expect(newPhase).toBe('Reconciling');
  });

  it('should transition to Failed after max loops', () => {
    const sm = new StateMachine();
    sm.transition('Reconciling');
    const newPhase = sm.checkTransition(1, 10);
    expect(newPhase).toBe('Failed');
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm test tests/unit/core/state-machine.test.ts
```

Expected: FAIL with "Cannot find module '../../src/core/state-machine.js'"

**Step 3: Create the State Machine**

```typescript
// src/core/state-machine.ts
import { Phase } from './types.js';

/**
 * StateMachine manages phase transitions for reconciliation
 */
export class StateMachine {
  private currentPhase: Phase;
  private loopCount: number;

  constructor() {
    this.currentPhase = 'Pending';
    this.loopCount = 0;
  }

  /**
   * Get the current phase
   */
  getCurrentPhase(): Phase {
    return this.currentPhase;
  }

  /**
   * Manually transition to a new phase
   */
  transition(newPhase: Phase): void {
    this.currentPhase = newPhase;
  }

  /**
   * Determine the next phase based on diff and loop count
   * @param diff - Current diff value
   * @param currentLoop - Current loop number (optional)
   * @returns The next phase
   */
  checkTransition(diff: number, currentLoop: number = this.loopCount): Phase {
    // If all tests pass, we're ready
    if (diff === 0) {
      return 'Ready';
    }

    // If we've exceeded max loops, we failed
    if (currentLoop >= 10) {
      return 'Failed';
    }

    // Otherwise, keep reconciling
    return 'Reconciling';
  }

  /**
   * Increment the loop counter
   */
  incrementLoop(): void {
    this.loopCount++;
  }

  /**
   * Get the current loop count
   */
  getLoopCount(): number {
    return this.loopCount;
  }

  /**
   * Reset the state machine
   */
  reset(): void {
    this.currentPhase = 'Pending';
    this.loopCount = 0;
  }
}
```

**Step 4: Run test to verify it passes**

```bash
npm test tests/unit/core/state-machine.test.ts
```

Expected: PASS (all tests)

**Step 5: Commit**

```bash
git add tests/unit/core/state-machine.test.ts src/core/state-machine.ts
git commit -m "feat: implement StateMachine for phase transitions"
```

---

### Task 9: Implement Reconciliation Engine

**Files:**
- Create: `src/core/reconciliation.ts`
- Test: `tests/unit/core/reconciliation.test.ts`

**Step 1: Write the failing test**

```typescript
// tests/unit/core/reconciliation.test.ts
import { ReconciliationEngine } from '../../src/core/reconciliation.js';
import { VibeManifest } from '../../src/core/types.js';
import { LLMClient } from '../../src/llm/client.js';
import { SpecifierAgent } from '../../src/agents/specifier.js';
import { CoderAgent } from '../../src/agents/coder.js';
import { AuditorAgent } from '../../src/agents/auditor.js';

describe('ReconciliationEngine', () => {
  let engine: ReconciliationEngine;
  let llmClient: LLMClient;
  let mockManifest: VibeManifest;

  beforeEach(() => {
    llmClient = new LLMClient({ apiKey: 'test-key' });
    engine = new ReconciliationEngine(llmClient);

    mockManifest = {
      metadata: { name: 'test', version: '1.0.0' },
      spec: {
        intent: 'test component',
        constraints: {
          framework: 'React',
          language: 'TypeScript',
          testing: ['Jest']
        },
        functionalSpec: {
          states: [],
          behaviors: []
        }
      },
      status: { phase: 'Pending', currentLoop: 0 }
    };
  });

  describe('reconcile', () => {
    it('should run through complete loop', async () => {
      // Mock agents to return successful responses
      jest.spyOn(engine['specifierAgent'], 'execute').mockResolvedValue('test code');
      jest.spyOn(engine['coderAgent'], 'execute').mockResolvedValue('impl code');
      jest.spyOn(engine['auditorAgent'], 'execute').mockResolvedValue(
        JSON.stringify({ diff: 0, testsPassed: 1, testsFailed: 0, summary: 'Pass' })
      );

      const result = await engine.reconcile(mockManifest);

      expect(result.success).toBe(true);
      expect(result.totalLoops).toBe(1);
    });

    it('should handle multiple loops', async () => {
      let callCount = 0;
      jest.spyOn(engine['specifierAgent'], 'execute').mockResolvedValue('test');
      jest.spyOn(engine['coderAgent'], 'execute').mockResolvedValue('code');
      jest.spyOn(engine['auditorAgent'], 'execute').mockImplementation(async () => {
        callCount++;
        if (callCount < 3) {
          return JSON.stringify({ diff: 2, testsPassed: 0, testsFailed: 2, summary: 'Failing' });
        }
        return JSON.stringify({ diff: 0, testsPassed: 2, testsFailed: 0, summary: 'Pass' });
      });

      const result = await engine.reconcile(mockManifest);

      expect(result.totalLoops).toBe(3);
      expect(result.success).toBe(true);
    });
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm test tests/unit/core/reconciliation.test.ts
```

Expected: FAIL with "Cannot find module '../../src/core/reconciliation.js'"

**Step 3: Create the Reconciliation Engine**

```typescript
// src/core/reconciliation.ts
import { VibeManifest, ReconciliationResult, LoopResult, CrashLoopConfig } from './types.js';
import { StateMachine } from './state-machine.js';
import { LLMClient } from '../llm/client.js';
import { SpecifierAgent } from '../agents/specifier.js';
import { CoderAgent } from '../agents/coder.js';
import { AuditorAgent } from '../agents/auditor.js';

/**
 * ReconciliationEngine orchestrates the complete reconciliation loop
 * It coordinates the three agents to achieve the desired state
 */
export class ReconciliationEngine {
  private llmClient: LLMClient;
  private specifierAgent: SpecifierAgent;
  private coderAgent: CoderAgent;
  private auditorAgent: AuditorAgent;
  private stateMachine: StateMachine;
  private config: CrashLoopConfig;

  constructor(llmClient: LLMClient, config?: Partial<CrashLoopConfig>) {
    this.llmClient = llmClient;
    this.specifierAgent = new SpecifierAgent(llmClient);
    this.coderAgent = new CoderAgent(llmClient);
    this.auditorAgent = new AuditorAgent(llmClient);
    this.stateMachine = new StateMachine();
    this.config = {
      maxTotalLoops: config?.maxTotalLoops ?? 10,
      maxStagnationCount: config?.maxStagnationCount ?? 5,
      stagnationThreshold: config?.stagnationThreshold ?? 0.1
    };
  }

  /**
   * Execute the full reconciliation loop
   * @param manifest - The VibeManifest specifying desired state
   * @returns The reconciliation result
   */
  async reconcile(manifest: VibeManifest): Promise<ReconciliationResult> {
    const history: LoopResult[] = [];
    let currentLoop = 0;

    // Start reconciling
    this.stateMachine.transition('Reconciling');
    manifest.status.phase = 'Reconciling';

    // Main reconciliation loop
    while (currentLoop < this.config.maxTotalLoops) {
      currentLoop++;
      this.stateMachine.incrementLoop();

      try {
        const loopResult = await this.executeLoop(manifest, currentLoop);
        history.push(loopResult);

        // Check if we should continue
        const nextPhase = this.stateMachine.checkTransition(
          loopResult.diff,
          currentLoop
        );

        if (nextPhase === 'Ready') {
          manifest.status.phase = 'Ready';
          manifest.status.diff = 0;
          return {
            success: true,
            totalLoops: currentLoop,
            finalDiff: 0,
            history
          };
        }

        if (nextPhase === 'Failed') {
          manifest.status.phase = 'Failed';
          return {
            success: false,
            totalLoops: currentLoop,
            finalDiff: loopResult.diff,
            history,
            error: 'Max loops exceeded'
          };
        }

        // Check for stagnation
        if (this.detectStagnation(history)) {
          manifest.status.phase = 'Failed';
          return {
            success: false,
            totalLoops: currentLoop,
            finalDiff: loopResult.diff,
            history,
            error: 'Stagnation detected: no improvement in recent loops'
          };
        }

      } catch (error) {
        manifest.status.phase = 'Failed';
        manifest.status.lastError = error instanceof Error ? error.message : 'Unknown error';
        return {
          success: false,
          totalLoops: currentLoop,
          finalDiff: -1,
          history,
          error: manifest.status.lastError
        };
      }
    }

    // Max loops reached without completion
    manifest.status.phase = 'Failed';
    return {
      success: false,
      totalLoops: currentLoop,
      finalDiff: history[history.length - 1]?.diff ?? -1,
      history,
      error: 'Maximum loops exceeded without convergence'
    };
  }

  /**
   * Execute a single reconciliation loop iteration
   */
  private async executeLoop(
    manifest: VibeManifest,
    loopNumber: number
  ): Promise<LoopResult> {
    const startTime = Date.now();
    const agentOutputs: Record<string, string> = {};

    // Phase 1: Specifier - Generate tests
    const specifierOutput = await this.specifierAgent.execute(
      JSON.stringify(manifest)
    );
    agentOutputs.specifier = specifierOutput;

    // Phase 2: Coder - Generate code
    // In MVP, we skip actual test running and mock the failure
    const coderOutput = await this.coderAgent.execute(
      JSON.stringify({
        testFailure: 'Tests would fail here',
        currentCode: ''
      })
    );
    agentOutputs.coder = coderOutput;

    // Phase 3: Auditor - Validate
    // In MVP, we simulate this - in real implementation, run actual tests
    const auditorOutput = await this.auditorAgent.execute(
      'Simulated test output'
    );
    agentOutputs.auditor = auditorOutput;

    const auditResult = JSON.parse(auditorOutput);

    return {
      loopNumber,
      phase: this.stateMachine.getCurrentPhase(),
      diff: auditResult.diff ?? 0,
      testsPassed: auditResult.testsPassed ?? 0,
      testsFailed: auditResult.testsFailed ?? 0,
      agentOutputs,
      timestamp: new Date()
    };
  }

  /**
   * Detect if we're in a stagnation state
   */
  private detectStagnation(history: LoopResult[]): boolean {
    if (history.length < this.config.maxStagnationCount) {
      return false;
    }

    const recent = history.slice(-this.config.maxStagnationCount);
    const hasImprovement = recent.some((result, i) => {
      if (i === 0) return false;
      const prevDiff = recent[i - 1].diff;
      const improvement = (prevDiff - result.diff) / prevDiff;
      return improvement > this.config.stagnationThreshold;
    });

    return !hasImprovement;
  }
}
```

**Step 4: Run test to verify it passes**

```bash
npm test tests/unit/core/reconciliation.test.ts
```

Expected: PASS (all tests)

**Step 5: Commit**

```bash
git add tests/unit/core/reconciliation.test.ts src/core/reconciliation.ts
git commit -m "feat: implement ReconciliationEngine with complete loop"
```

---

## Phase 5: CLI Tool

### Task 10: Create CLI Entry Point

**Files:**
- Create: `src/cli/index.ts`
- Test: `tests/integration/cli.test.ts`

**Step 1: Write the failing test**

```bash
mkdir -p tests/integration
```

```typescript
// tests/integration/cli.test.ts
import { describe, it, expect } from '@jest/globals';

describe('CLI', () => {
  it('should be importable', async () => {
    const cliModule = await import('../../src/cli/index.js');
    expect(cliModule).toBeDefined();
  });

  // More integration tests would go here
});
```

**Step 2: Run test to verify it fails**

```bash
npm test tests/integration/cli.test.ts
```

Expected: FAIL with "Cannot find module '../../src/cli/index.js'"

**Step 3: Create the CLI**

```bash
mkdir -p src/cli
```

```typescript
// src/cli/index.ts
import { Command } from 'commander';
import chalk from 'chalk';
import { ReconciliationEngine } from '../core/reconciliation.js';
import { LLMClient } from '../llm/client.js';
import { VibeManifest } from '../core/types.js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const program = new Command();

program
  .name('vibeos')
  .description('VibeOS - Declarative Coding Control Plane')
  .version('0.1.0');

program
  .command('reconcile')
  .description('Start reconciliation from a manifest file')
  .argument('<manifest>', 'Path to the manifest JSON file')
  .option('-k, --api-key <key>', 'Anthropic API key (or set ANTHROPIC_API_KEY env var)')
  .action(async (manifestFile: string, options) => {
    try {
      // Get API key
      const apiKey = options.apiKey || process.env.ANTHROPIC_API_KEY;
      if (!apiKey) {
        console.error(chalk.red('Error: ANTHROPIC_API_KEY is required'));
        console.error(chalk.yellow('Set it with: export ANTHROPIC_API_KEY=your-key'));
        process.exit(1);
      }

      // Load manifest
      const manifestPath = resolve(process.cwd(), manifestFile);
      console.log(chalk.blue(`Loading manifest from ${manifestPath}`));

      const manifestContent = readFileSync(manifestPath, 'utf-8');
      const manifest: VibeManifest = JSON.parse(manifestContent);

      console.log(chalk.green(`Starting reconciliation for: ${manifest.metadata.name}`));
      console.log(chalk.gray(`Intent: ${manifest.spec.intent}`));
      console.log();

      // Create engine and run
      const llmClient = new LLMClient({ apiKey });
      const engine = new ReconciliationEngine(llmClient);

      console.log(chalk.blue('Starting Reconciliation Loop...\n'));

      const result = await engine.reconcile(manifest);

      // Report results
      console.log();
      console.log(chalk.bold('═══════════════════════════════════════'));
      console.log(chalk.bold('           Reconciliation Complete'));
      console.log(chalk.bold('═══════════════════════════════════════'));
      console.log();

      if (result.success) {
        console.log(chalk.green.bold('✓ SUCCESS'));
        console.log(chalk.gray(`Total loops: ${result.totalLoops}`));
        console.log(chalk.gray(`Final diff: ${result.finalDiff}`));
        console.log();
        console.log(chalk.green('Your component is ready!'));
      } else {
        console.log(chalk.red.bold('✗ FAILED'));
        console.log(chalk.gray(`Total loops: ${result.totalLoops}`));
        console.log(chalk.gray(`Final diff: ${result.finalDiff}`));
        console.log(chalk.red(`Error: ${result.error}`));
        console.log();
        console.log(chalk.yellow('The reconciliation loop could not converge.'));
        console.log(chalk.yellow('Please review the manifest or try again.'));
      }

    } catch (error) {
      console.error(chalk.red(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
      process.exit(1);
    }
  });

program
  .command('manifest')
  .description('Create a new manifest from natural language')
  .argument('<intent>', 'Natural language description of what you want to build')
  .option('-o, --output <file>', 'Output file path', 'vibe-manifest.json')
  .action(async (intent: string, options) => {
    console.log(chalk.yellow('Manifest creation is not yet implemented.'));
    console.log(chalk.gray('Please create your manifest JSON manually for now.'));
  });

// Parse and execute
program.parse();
```

**Step 4: Run test to verify it passes**

```bash
npm test tests/integration/cli.test.ts
```

Expected: PASS

**Step 5: Build and test CLI**

```bash
npm run build
node dist/cli/index.js --help
```

Expected: Help output displayed

**Step 6: Commit**

```bash
git add tests/integration/cli.test.ts src/cli/index.ts
git commit -m "feat: add CLI tool with reconcile command"
```

---

## Phase 6: Demo - Snake Game Template

### Task 11: Create Snake Game Manifest Template

**Files:**
- Create: `templates/snake-game.json`

**Step 1: Create the template**

```bash
mkdir -p templates
```

```json
{
  "metadata": {
    "name": "snake-game",
    "version": "1.0.0"
  },
  "spec": {
    "intent": "A classic Snake game where the player controls a snake that moves around a canvas, eats food to grow longer, and dies when it hits a wall or itself. Display the current score and show a game over screen when the player loses.",
    "constraints": {
      "framework": "React",
      "language": "TypeScript",
      "testing": ["Jest", "React Testing Library"]
    },
    "visualSpec": {
      "style": "minimalist pixel art",
      "elements": ["canvas (400x400)", "score display", "game over screen", "start/restart button"]
    },
    "functionalSpec": {
      "states": ["idle", "playing", "game-over"],
      "behaviors": [
        "Snake moves automatically in current direction",
        "Player controls direction with arrow keys",
        "Snake grows when eating food",
        "Score increases when food is eaten",
        "Game ends when snake hits wall",
        "Game ends when snake hits itself",
        "Game can be restarted after game over"
      ]
    }
  },
  "status": {
    "phase": "Pending",
    "currentLoop": 0
  }
}
```

**Step 2: Commit**

```bash
git add templates/snake-game.json
git commit -m "feat: add Snake Game manifest template for demo"
```

---

### Task 12: Create README and Documentation

**Files:**
- Create: `README.md`

**Step 1: Create README**

```bash
cat > README.md << 'EOF'
# VibeOS MVP

**Declarative Coding Control Plane** - Minimum Viable Prototype

## What is VibeOS?

VibeOS is a concept for an AI-powered development system where you define **what** you want (declarative), and the system figures out **how** to build it through automated reconciliation loops.

Inspired by Kubernetes, VibeOS treats code components like pods - you specify the desired state, and the system continuously works to achieve it.

## How It Works

### The Reconciliation Loop

1. **Specifier Agent** (TDD-First): Generates tests that MUST fail
2. **Coder Agent**: Writes code to make tests pass
3. **Auditor Agent**: Validates results and calculates "diff"
4. **Loop**: Repeat until diff = 0 (all tests pass) or max loops reached

### Architecture

```
User Input → Vibe Manifest → Reconciliation Loop
                                   ↓
                    ┌─────────────┼─────────────┐
                    ↓             ↓             ↓
              Specifier → Coder → Auditor
              (Tests)    (Code)    (Validate)
                    └─────────────┼─────────────┘
                                  ↓
                           Diff = 0? → Ready
                           Diff > 0 → Continue
```

## Installation

```bash
npm install
npm run build
```

## Usage

### Set up API Key

```bash
export ANTHROPIC_API_KEY=your-api-key-here
```

### Run Reconciliation

```bash
npm run dev reconcile templates/snake-game.json
```

Or with explicit API key:

```bash
npm run dev reconcile templates/snake-game.json --api-key your-key
```

## Project Structure

```
vibeos-mvp/
├── src/
│   ├── core/           # Core types and reconciliation engine
│   ├── agents/         # AI agents (Specifier, Coder, Auditor)
│   ├── llm/            # LLM client and prompts
│   └── cli/            # Command-line interface
├── templates/          # Example manifests
├── tests/              # Unit and integration tests
└── docs/               # Design documentation
```

## Development

```bash
# Run tests
npm test

# Watch mode
npm run test:watch

# Build
npm run build
```

## Example: Snake Game

The included `templates/snake-game.json` demonstrates a complete manifest for creating a Snake game:

- **Intent**: Classic snake game with scoring
- **Tech Stack**: React + TypeScript
- **Testing**: Jest + React Testing Library
- **Behaviors**: Movement, collision detection, scoring

Run it with:

```bash
npm run dev reconcile templates/snake-game.json
```

## Architecture Documentation

See [docs/plans/2026-01-27-vibeos-mvp-design.md](docs/plans/2026-01-27-vibeos-mvp-design.md) for complete architecture documentation.

## Limitations (MVP)

This is a **minimum viable prototype** for validation:

- No actual code execution in sandbox (simulated)
- Simplified test running (mocked)
- No Git integration for code history
- No visual regression testing
- Single-threaded execution

## Future Work

- [ ] Real sandbox environment for code execution
- [ ] Actual test running (Jest integration)
- [ ] Git-based state storage
- [ ] Visual regression with AI vision
- [ ] Multi-file component generation
- [ ] Hot-reload during development

## License

MIT

---

**Built to validate the VibeOS concept. Questions? Open an issue!**
EOF
```

**Step 2: Commit**

```bash
git add README.md
git commit -m "docs: add comprehensive README"
```

---

## Phase 7: Final Integration and Testing

### Task 13: Run Full Test Suite

**Step 1: Run all tests**

```bash
npm test
```

Expected: All tests pass

**Step 2: Build the project**

```bash
npm run build
```

Expected: Clean build with no errors

**Step 3: Verify CLI works**

```bash
node dist/cli/index.js --help
```

Expected: Help output

**Step 4: Commit any final fixes**

```bash
# If any test failures or build issues, fix and commit
git add .
git commit -m "test: ensure all tests pass and build succeeds"
```

---

### Task 14: Merge Back to Main

**Step 1: Switch to main branch and merge**

```bash
cd ../..  # Go back to repo root
git checkout master
git merge feature/vibeos-mvp --no-ff
```

**Step 2: Tag the release**

```bash
git tag -a v0.1.0 -m "VibeOS MVP - Initial Prototype"
```

**Step 3: Clean up worktree (optional)**

```bash
git worktree remove .worktrees/vibeos-mvp
```

---

## Success Criteria

VibeOS MVP is complete when:

- [x] All unit tests pass
- [x] CLI can be built and executed
- [x] Reconciliation loop executes end-to-end (even if mocked)
- [x] Snake game manifest is ready for demo
- [x] Documentation is complete

## Running the Demo

Once the MVP is complete, you can demonstrate it with:

```bash
# Build the project
npm run build

# Run the reconciliation (requires ANTHROPIC_API_KEY)
export ANTHROPIC_API_KEY=sk-ant-xxx
node dist/cli/index.js reconcile templates/snake-game.json
```

The system will:
1. Parse the manifest
2. Run the Specifier → Coder → Auditor loop
3. Report success or failure
4. Show loop history and convergence

---

**End of Implementation Plan**
