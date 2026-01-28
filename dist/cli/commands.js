import { ReconciliationEngine } from '../core/reconciliation.js';
import { LLMClient } from '../llm/client.js';
import { readFileSync } from 'fs';
import { resolve } from 'path';
export function registerCommands(program) {
    program
        .command('reconcile')
        .description('Start the reconciliation loop')
        .option('-m, --manifest <path>', 'Path to Vibe manifest file')
        .option('-w, --watch', 'Watch for changes and auto-reconcile (not yet implemented)')
        .option('--max-loops <number>', 'Maximum reconciliation iterations', '10')
        .option('--api-url <url>', 'Custom API endpoint URL (overrides ANTHROPIC_BASE_URL)')
        .action(async (options) => {
        console.log('VibeOS Reconciliation starting...');
        console.log('');
        // Validate manifest option
        if (!options.manifest) {
            console.error('Error: --manifest option is required');
            console.error('Usage: vibeos reconcile --manifest <path>');
            process.exit(1);
        }
        // Load manifest
        const manifestPath = resolve(options.manifest);
        console.log(`Loading manifest from: ${manifestPath}`);
        let manifest;
        try {
            const content = readFileSync(manifestPath, 'utf-8');
            manifest = JSON.parse(content);
        }
        catch (error) {
            console.error(`Error loading manifest: ${error}`);
            process.exit(1);
        }
        console.log(`Manifest: ${manifest.metadata.name} v${manifest.metadata.version}`);
        console.log(`Intent: ${manifest.spec.intent}`);
        console.log('');
        // Create LLM client with optional custom API URL
        const llmClientConfig = {};
        if (options.apiUrl || process.env.ANTHROPIC_BASE_URL) {
            llmClientConfig.baseURL = options.apiUrl || process.env.ANTHROPIC_BASE_URL;
            console.log(`Using custom API endpoint: ${llmClientConfig.baseURL}`);
        }
        const llmClient = new LLMClient(llmClientConfig);
        const engine = new ReconciliationEngine(llmClient, {
            maxTotalLoops: parseInt(options.maxLoops, 10),
        });
        console.log('Starting reconciliation loop...');
        console.log('');
        const result = await engine.reconcile(manifest);
        // Report results
        console.log('');
        console.log('=== Reconciliation Complete ===');
        console.log(`Final Phase: ${result.finalPhase}`);
        console.log(`Total Loops: ${result.totalLoops}`);
        console.log('');
        if (result.success) {
            console.log('Status: SUCCESS');
            console.log('');
            console.log('Loop History:');
            result.loopHistory.forEach((loop, index) => {
                console.log(`  Loop ${index + 1}: phase=${loop.phase}, success=${loop.success}, diff=${loop.diff}`);
            });
        }
        else {
            console.log('Status: FAILED');
            console.log(`Error: ${result.error}`);
            console.log('');
            console.log('Loop History:');
            result.loopHistory.forEach((loop, index) => {
                console.log(`  Loop ${index + 1}: phase=${loop.phase}, success=${loop.success}, diff=${loop.diff}, error=${loop.error || 'none'}`);
            });
        }
        if (options.watch) {
            console.log('');
            console.log('Note: --watch mode is not yet implemented');
        }
    });
}
//# sourceMappingURL=commands.js.map