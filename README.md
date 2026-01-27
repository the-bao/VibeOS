# VibeOS MVP

> **Declarative Coding Control Plane** - A minimum viable prototype demonstrating intent-based software development through automated reconciliation loops.

## Overview

VibeOS is a conceptual framework for declarative programming inspired by Kubernetes. Instead of writing code imperatively, you define a **VibeManifest** describing your desired state, and VibeOS automatically reconciles the actual code to match through a continuous loop of:

1. **Specifier Agent** (TDD-first) → Generates tests
2. **Coder Agent** → Generates/fixes code
3. **Auditor Agent** → Calculates diff

When `diff = 0`, the system reaches the "Ready" state.

## Architecture

```
┌─────────────────┐
│  VibeManifest   │ ← Desired State (JSON)
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│   ReconciliationEngine          │
│   - Orchestrates 3 agents       │
│   - Crash loop detection        │
│   - State management            │
└────────┬────────────────────────┘
         │
    ┌────┴────┬──────────┐
    ▼         ▼          ▼
┌───────┐ ┌───────┐ ┌─────────┐
│Spec  │ │Coder │ │Auditor  │
│Agent │ │Agent │ │ Agent   │
└───────┘ └───────┘ └─────────┘
    │         │          │
    └─────────┴──────────┘
              │
         Diff > 0? → Continue Loop
         Diff = 0? → Ready
```

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd vibeos-mvp

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test
```

## Configuration

Set your Anthropic API key:

```bash
export ANTHROPIC_API_KEY="your-api-key-here"
```

## Usage

### CLI Commands

```bash
# Display version
node dist/cli/index.js --version

# Run reconciliation on a manifest
node dist/cli/index.js reconcile --manifest templates/snake-game.json

# With custom max loops
node dist/cli/index.js reconcile --manifest templates/snake-game.json --max-loops 5
```

### Programmatic Usage

```typescript
import { LLMClient } from './llm/client.js';
import { ReconciliationEngine } from './core/reconciliation.js';
import type { VibeManifest } from './core/types.js';

// Create client and engine
const llmClient = new LLMClient();
const engine = new ReconciliationEngine(llmClient, {
  maxTotalLoops: 10,
  maxStagnationCount: 5,
  stagnationThreshold: 0.1,
});

// Load manifest
const manifest: VibeManifest = {
  metadata: { name: 'my-component', version: '1.0.0' },
  spec: {
    intent: 'A button component with click handler',
    constraints: {
      framework: 'React',
      language: 'TypeScript',
      testing: ['Jest'],
    },
    functionalSpec: {
      states: ['idle', 'loading', 'disabled'],
      behaviors: ['renders text', 'handles clicks'],
    },
  },
  status: { phase: 'Pending', currentLoop: 0 },
};

// Run reconciliation
const result = await engine.reconcile(manifest);

console.log(`Success: ${result.success}`);
console.log(`Final Phase: ${result.finalPhase}`);
console.log(`Total Loops: ${result.totalLoops}`);
```

## VibeManifest Format

```json
{
  "metadata": {
    "name": "component-name",
    "version": "1.0.0"
  },
  "spec": {
    "intent": "Description of what to build",
    "constraints": {
      "framework": "React",
      "language": "TypeScript",
      "testing": ["Jest", "React Testing Library"]
    },
    "visualSpec": {
      "style": "minimalist",
      "elements": ["button", "icon"]
    },
    "functionalSpec": {
      "states": ["idle", "loading", "success", "error"],
      "behaviors": [
        "renders text content",
        "handles click events",
        "shows loading spinner"
      ]
    }
  },
  "status": {
    "phase": "Pending",
    "currentLoop": 0
  }
}
```

## Project Structure

```
vibeos-mvp/
├── src/
│   ├── core/           # Core types and engine
│   ├── agents/         # Specifier, Coder, Auditor agents
│   ├── llm/            # LLM client and prompts
│   ├── storage/        # State storage
│   └── cli/            # Command-line interface
├── templates/          # Example manifests
├── tests/              # Unit tests
└── docs/               # Design documentation
```

## Development

```bash
# Run tests in watch mode
npm run test:watch

# Run linter
npm run lint

# Format code
npm run format
```

## Testing

The project has comprehensive unit tests:

```bash
npm test
```

**Test Coverage:**
- 57 tests passing
- 8 test suites
- All core components covered

## Demo Scenario

A Snake Game manifest is provided in `templates/snake-game.json` to demonstrate the full reconciliation loop:

```bash
node dist/cli/index.js reconcile --manifest templates/snake-game.json
```

## Limitations (MVP)

This is a **minimum viable prototype** with intentional simplifications:

- **No actual code execution** - Tests are simulated, not run
- **No sandbox** - Generated code is not executed
- **No Git integration** - No version control for generated code
- **In-memory state** - No persistent storage
- **Single-threaded** - No parallel execution

## Next Steps

For production deployment, the following would be needed:

1. **Real test execution** - Run generated tests in a sandbox
2. **Git integration** - Track code changes in version control
3. **Persistent storage** - Database for state management
4. **Observability** - Logging, metrics, tracing
5. **Error recovery** - Retry logic, exponential backoff
6. **Security** - Input sanitization, code isolation

## Documentation

- [VibeOS Concept](./VibeOS.md) - High-level architectural concept (Chinese)
- [Design Document](./docs/plans/2026-01-27-vibeos-mvp-design.md) - Detailed design
- [Implementation Plan](./docs/plans/2026-01-27-vibeos-mvp-implementation.md) - Development plan

## License

MIT

## Contributing

This is a research prototype. Contributions welcome!
