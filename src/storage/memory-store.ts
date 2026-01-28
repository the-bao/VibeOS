// src/storage/memory-store.ts
import { VibeManifest, LoopResult } from '../core/types.js';

/**
 * MemoryStateStore provides in-memory storage for VibeOS state
 * Stores manifests and loop history for the reconciliation engine
 */
export class MemoryStateStore {
  private manifests: Map<string, VibeManifest>;
  private loopHistories: Map<string, LoopResult[]>;

  constructor() {
    this.manifests = new Map();
    this.loopHistories = new Map();
  }

  /**
   * Store a manifest with the given ID
   * @param id - Unique identifier for the manifest
   * @param manifest - The VibeManifest to store
   */
  setManifest(id: string, manifest: VibeManifest): void {
    this.manifests.set(id, manifest);
  }

  /**
   * Retrieve a manifest by ID
   * @param id - Unique identifier for the manifest
   * @returns The VibeManifest or undefined if not found
   */
  getManifest(id: string): VibeManifest | undefined {
    return this.manifests.get(id);
  }

  /**
   * Delete a manifest by ID
   * @param id - Unique identifier for the manifest
   */
  deleteManifest(id: string): void {
    this.manifests.delete(id);
    this.loopHistories.delete(id);
  }

  /**
   * List all manifest IDs
   * @returns Array of manifest IDs
   */
  listManifests(): string[] {
    return Array.from(this.manifests.keys());
  }

  /**
   * Get the count of stored manifests
   * @returns Number of manifests
   */
  getManifestCount(): number {
    return this.manifests.size;
  }

  /**
   * Append a loop result to the history for a manifest
   * @param id - Unique identifier for the manifest
   * @param result - The LoopResult to append
   */
  appendLoopResult(id: string, result: LoopResult): void {
    if (!this.loopHistories.has(id)) {
      this.loopHistories.set(id, []);
    }
    this.loopHistories.get(id)!.push(result);
  }

  /**
   * Get the loop history for a manifest
   * @param id - Unique identifier for the manifest
   * @returns Array of LoopResults (empty array if none)
   */
  getLoopHistory(id: string): LoopResult[] {
    return this.loopHistories.get(id) || [];
  }

  /**
   * Clear the loop history for a manifest
   * @param id - Unique identifier for the manifest
   */
  clearLoopHistory(id: string): void {
    this.loopHistories.delete(id);
  }

  /**
   * Clear all stored data (manifests and histories)
   */
  clear(): void {
    this.manifests.clear();
    this.loopHistories.clear();
  }
}
