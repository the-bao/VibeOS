export interface LLMMessage {
    role: 'user' | 'assistant';
    content: string;
}
export interface LLMResponse {
    content: string;
    usage?: {
        inputTokens: number;
        outputTokens: number;
    };
}
export interface LLMClientConfig {
    apiKey?: string;
    baseURL?: string;
    timeout?: number;
}
export declare class LLMClient {
    private client;
    constructor(config?: LLMClientConfig | string);
    complete(messages: LLMMessage[], options?: {
        maxTokens?: number;
        model?: string;
        systemPrompt?: string;
    }): Promise<LLMResponse>;
    completeSystem(systemPrompt: string, userMessage: string, options?: {
        maxTokens?: number;
        model?: string;
    }): Promise<LLMResponse>;
}
//# sourceMappingURL=client.d.ts.map