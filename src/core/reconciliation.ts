// src/core/reconciliation.ts
import { VibeManifest, ReconciliationResult, LoopResult, CrashLoopConfig, Phase } from './types.js';
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
    this.specifierAgent = new SpecifierAgent();
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
        const loopResult = await this.executeLoop(manifest, currentLoop, history);
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
            finalPhase: 'Ready',
            totalLoops: currentLoop,
            loopHistory: history
          };
        }

        if (nextPhase === 'Failed') {
          manifest.status.phase = 'Failed';
          return {
            success: false,
            finalPhase: 'Failed',
            totalLoops: currentLoop,
            loopHistory: history,
            error: 'Max loops exceeded'
          };
        }

        // Check for crash loop/stagnation
        if (this.detectCrashLoop(history)) {
          manifest.status.phase = 'Failed';
          return {
            success: false,
            finalPhase: 'Failed',
            totalLoops: currentLoop,
            loopHistory: history,
            error: 'Crash loop detected: no improvement in recent loops'
          };
        }

      } catch (error) {
        manifest.status.phase = 'Failed';
        manifest.status.lastError = error instanceof Error ? error.message : 'Unknown error';
        return {
          success: false,
          finalPhase: 'Failed',
          totalLoops: currentLoop,
          loopHistory: history,
          error: manifest.status.lastError
        };
      }
    }

    // Max loops reached without completion
    manifest.status.phase = 'Failed';
    return {
      success: false,
      finalPhase: 'Failed',
      totalLoops: currentLoop,
      loopHistory: history,
      error: 'Maximum loops exceeded without convergence'
    };
  }

  /**
   * Execute a single reconciliation loop iteration
   */
  private async executeLoop(
    manifest: VibeManifest,
    loopNumber: number,
    history: LoopResult[]
  ): Promise<LoopResult> {
    const startTime = Date.now();
    const agentOutputs: Record<string, string> = {};
    let currentCode = '';

    // Phase 1: Specifier - Generate tests
    const specifierOutput = await this.specifierAgent.execute({
      manifest,
      currentCode,
      loopNumber,
      previousResults: history
    });
    agentOutputs.specifier = specifierOutput;

    // Phase 2: Coder - Generate code
    // In MVP, we pass empty test results - in real implementation, run actual tests
    const coderOutput = await this.coderAgent.execute({
      manifest,
      currentCode,
      loopNumber,
      previousResults: history
    });
    agentOutputs.coder = coderOutput;
    currentCode = coderOutput;

    // Phase 3: Auditor - Validate
    // In MVP, we simulate this - in real implementation, run actual tests
    const auditorOutput = await this.auditorAgent.execute({
      manifest,
      currentCode,
      loopNumber,
      previousResults: history
    });
    agentOutputs.auditor = auditorOutput;

    // Parse auditor result
    let diff = 0;
    let success = false;
    try {
      const auditResult = JSON.parse(auditorOutput);
      diff = auditResult.totalDiff ?? 0;
      success = diff === 0;
    } catch {
      // If parsing fails, assume failure
      diff = -1;
      success = false;
    }

    return {
      loopNumber,
      phase: 'auditor', // Always end on auditor phase
      success,
      diff,
      output: auditorOutput,
      timestamp: new Date()
    };
  }

  /**
   * Detect if we're in a crash loop or stagnation state
   * This is the main crash loop detection function
   *
   * @param history - Array of previous loop results
   * @returns true if crash loop detected, false otherwise
   */
  detectCrashLoop(history: LoopResult[]): boolean {
    // Need at least maxStagnationCount loops to detect stagnation
    if (history.length < this.config.maxStagnationCount) {
      return false;
    }

    // Get the most recent loops
    const recent = history.slice(-this.config.maxStagnationCount);

    // Check if there's any meaningful improvement
    // Improvement means: diff decreased by at least stagnationThreshold percentage
    let hasImprovement = false;

    for (let i = 1; i < recent.length; i++) {
      const prevDiff = recent[i - 1].diff;
      const currDiff = recent[i].diff;

      // Skip if previous diff was 0 (should have stopped already)
      if (prevDiff === 0) {
        continue;
      }

      // Calculate improvement percentage
      const improvement = (prevDiff - currDiff) / prevDiff;

      // If improvement exceeds threshold, we're making progress
      if (improvement >= this.config.stagnationThreshold) {
        hasImprovement = true;
        break;
      }
    }

    // Crash loop detected if no improvement in recent loops
    return !hasImprovement;
  }
}
