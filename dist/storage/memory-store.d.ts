import { VibeManifest, LoopResult } from '../core/types.js';
/**
 * MemoryStateStore provides in-memory storage for VibeOS state
 * Stores manifests and loop history for the reconciliation engine
 */
export declare class MemoryStateStore {
    private manifests;
    private loopHistories;
    constructor();
    /**
     * Store a manifest with the given ID
     * @param id - Unique identifier for the manifest
     * @param manifest - The VibeManifest to store
     */
    setManifest(id: string, manifest: VibeManifest): void;
    /**
     * Retrieve a manifest by ID
     * @param id - Unique identifier for the manifest
     * @returns The VibeManifest or undefined if not found
     */
    getManifest(id: string): VibeManifest | undefined;
    /**
     * Delete a manifest by ID
     * @param id - Unique identifier for the manifest
     */
    deleteManifest(id: string): void;
    /**
     * List all manifest IDs
     * @returns Array of manifest IDs
     */
    listManifests(): string[];
    /**
     * Get the count of stored manifests
     * @returns Number of manifests
     */
    getManifestCount(): number;
    /**
     * Append a loop result to the history for a manifest
     * @param id - Unique identifier for the manifest
     * @param result - The LoopResult to append
     */
    appendLoopResult(id: string, result: LoopResult): void;
    /**
     * Get the loop history for a manifest
     * @param id - Unique identifier for the manifest
     * @returns Array of LoopResults (empty array if none)
     */
    getLoopHistory(id: string): LoopResult[];
    /**
     * Clear the loop history for a manifest
     * @param id - Unique identifier for the manifest
     */
    clearLoopHistory(id: string): void;
    /**
     * Clear all stored data (manifests and histories)
     */
    clear(): void;
}
//# sourceMappingURL=memory-store.d.ts.map