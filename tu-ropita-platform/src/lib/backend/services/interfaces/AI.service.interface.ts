export interface IAIService {
    getProductTagsFromGPT(description: string): Promise<string[]>;
}