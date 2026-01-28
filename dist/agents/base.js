import { LLMClient } from '../llm/client.js';
export class BaseAgent {
    llm;
    name;
    constructor(name, llm) {
        this.name = name;
        this.llm = llm || new LLMClient();
    }
    async callLLM(systemPrompt, userMessage) {
        const response = await this.llm.completeSystem(systemPrompt, userMessage);
        return response.content;
    }
    getName() {
        return this.name;
    }
}
//# sourceMappingURL=base.js.map