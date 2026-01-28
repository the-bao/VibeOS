// src/core/types.ts

/**
 * Phase of the reconciliation lifecycle
 */
export type Phase = 'Pending' | 'Reconciling' | 'Ready' | 'Failed';

/**
 * Tech stack constraints
 */
export interface TechConstraints {
  framework: string;
  language: string;
  testing: string[];
}

/**
 * Visual specification
 */
export interface VisualSpec {
  style?: string;
  elements: string[];
}

/**
 * Functional specification
 */
export interface FunctionalSpec {
  inputs?: string[];
  states: string[];
  behaviors: string[];
}

/**
 * Vibe Manifest specification
 */
export interface VibeSpec {
  intent: string;
  constraints: TechConstraints;
  visualSpec?: VisualSpec;
  functionalSpec: FunctionalSpec;
}

/**
 * Current status of reconciliation
 */
export interface VibeStatus {
  phase: Phase;
  currentLoop: number;
  lastError?: string;
  diff?: number;
}

/**
 * Vibe Manifest - The single source of truth
 */
export interface VibeManifest {
  metadata: {
    name: string;
    version: string;
  };
  spec: VibeSpec;
  status: VibeStatus;
}

/**
 * Result of a single reconciliation loop
 */
export interface LoopResult {
  loopNumber: number;
  phase: 'specifier' | 'coder' | 'auditor';
  success: boolean;
  diff: number;
  output?: string;
  error?: string;
  timestamp: Date;
}

/**
 * Configuration for crash loop detection
 */
export interface CrashLoopConfig {
  maxTotalLoops: number;
  maxStagnationCount: number;
  stagnationThreshold: number; // 0-1, percentage improvement required
}

/**
 * Final reconciliation result
 */
export interface ReconciliationResult {
  success: boolean;
  finalPhase: Phase;
  totalLoops: number;
  loopHistory: LoopResult[];
  error?: string;
}
