#!/usr/bin/env node
import { Command } from 'commander';
import { registerCommands } from './commands.js';
const program = new Command();
program
    .name('vibeos')
    .description('VibeOS CLI - Declarative Coding Control Plane')
    .version('0.1.0');
registerCommands(program);
program.parse();
//# sourceMappingURL=index.js.map