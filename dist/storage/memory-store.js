/**
 * MemoryStateStore provides in-memory storage for VibeOS state
 * Stores manifests and loop history for the reconciliation engine
 */
export class MemoryStateStore {
    manifests;
    loopHistories;
    constructor() {
        this.manifests = new Map();
        this.loopHistories = new Map();
    }
    /**
     * Store a manifest with the given ID
     * @param id - Unique identifier for the manifest
     * @param manifest - The VibeManifest to store
     */
    setManifest(id, manifest) {
        this.manifests.set(id, manifest);
    }
    /**
     * Retrieve a manifest by ID
     * @param id - Unique identifier for the manifest
     * @returns The VibeManifest or undefined if not found
     */
    getManifest(id) {
        return this.manifests.get(id);
    }
    /**
     * Delete a manifest by ID
     * @param id - Unique identifier for the manifest
     */
    deleteManifest(id) {
        this.manifests.delete(id);
        this.loopHistories.delete(id);
    }
    /**
     * List all manifest IDs
     * @returns Array of manifest IDs
     */
    listManifests() {
        return Array.from(this.manifests.keys());
    }
    /**
     * Get the count of stored manifests
     * @returns Number of manifests
     */
    getManifestCount() {
        return this.manifests.size;
    }
    /**
     * Append a loop result to the history for a manifest
     * @param id - Unique identifier for the manifest
     * @param result - The LoopResult to append
     */
    appendLoopResult(id, result) {
        if (!this.loopHistories.has(id)) {
            this.loopHistories.set(id, []);
        }
        this.loopHistories.get(id).push(result);
    }
    /**
     * Get the loop history for a manifest
     * @param id - Unique identifier for the manifest
     * @returns Array of LoopResults (empty array if none)
     */
    getLoopHistory(id) {
        return this.loopHistories.get(id) || [];
    }
    /**
     * Clear the loop history for a manifest
     * @param id - Unique identifier for the manifest
     */
    clearLoopHistory(id) {
        this.loopHistories.delete(id);
    }
    /**
     * Clear all stored data (manifests and histories)
     */
    clear() {
        this.manifests.clear();
        this.loopHistories.clear();
    }
}
//# sourceMappingURL=memory-store.js.map