import { LLMClient } from '../llm/client.js';
import { VibeManifest, LoopResult } from '../core/types.js';
export interface AgentContext {
    manifest: VibeManifest;
    currentCode: string;
    loopNumber: number;
    previousResults?: LoopResult[];
}
export declare abstract class BaseAgent {
    protected llm: LLMClient;
    protected name: string;
    constructor(name: string, llm?: LLMClient);
    abstract execute(context: AgentContext): Promise<string>;
    protected callLLM(systemPrompt: string, userMessage: string): Promise<string>;
    getName(): string;
}
//# sourceMappingURL=base.d.ts.map