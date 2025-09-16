import settings from "@/lib/settings";
import OpenAI from "openai";

export interface IAIService {
    createEmbedding(text: string): Promise<number[]>;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

class OpenAIService implements IAIService {

    private openai = new OpenAI({
        apiKey: settings.OPEN_AI.API_KEY,
    });

    async createEmbedding(text: string): Promise<number[]> {
        try {
            console.log(`Creating embedding for text: "${text.substring(0, 50)}..."`);
            
            const embedding = await this.openai.embeddings.create({
                input: text,
                model: "text-embedding-3-small"
            });
            
            return embedding.data[0].embedding;
        } catch (error) {
            console.log(`Error creating embedding: ${error}`);
            return [];
        }
    }

}

export const openAIService : IAIService = new OpenAIService();



