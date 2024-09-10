export interface IAIService {
    runAssistant(prompt: string): Promise<IAITagsResponse>;
}