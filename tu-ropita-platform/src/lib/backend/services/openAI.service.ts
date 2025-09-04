import settings from "@/lib/settings";
import OpenAI from "openai";
import { IAITagsResponse } from "../dtos/aiTags.response.interface";

export interface IAIService {
    runAssistant(prompt: string): Promise<IAITagsResponse>;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

class OpenAIService implements IAIService {

    private openai = new OpenAI({
        apiKey: settings.OPEN_AI.API_KEY,
    });

    async runAssistant(prompt: string): Promise<IAITagsResponse> {
        const assistant_id : string = 'asst_apHTNd6f6jAcfyna2prlDxLN';
        try {
            console.log(`Running OpenAI assistant. [assistant_id=${assistant_id}]`);
            const thread = await this.openai.beta.threads.create();
            await this.openai.beta.threads.messages.create(thread.id, {
                role: "user",
                content: prompt
            });

            const run = await this.openai.beta.threads.runs.create(thread.id, {
                assistant_id: assistant_id,
            });
            let runStatus = await this.openai.beta.threads.runs.retrieve(thread.id, run.id);
            while (runStatus.status !== 'completed') {
                await new Promise(resolve => setTimeout(resolve, 1000));
                runStatus = await this.openai.beta.threads.runs.retrieve(thread.id, run.id);
                console.log(`Assistant run status: ${runStatus.status}`);
            }

            const messages = await this.openai.beta.threads.messages.list(thread.id);
            const assistantMessages = messages.data.filter(message => message.role === 'assistant');
            const lastMessage = assistantMessages[assistantMessages.length - 1];
            if (lastMessage && lastMessage.content.length > 0) {
                const content = lastMessage.content[0];
                if (content.type === 'text') {
                    return JSON.parse(content.text.value) as IAITagsResponse;
                } else {
                    throw new Error("The assistant's response was not in text format.");
                }
            } else {
                throw new Error("No response from the assistant.");
            }

        } catch (error) {
            console.log(`Error using OpenAI Assistants API: ${error}`);
            return {};
            // throw error;
        }
    }

}

export const openAIService : IAIService = new OpenAIService();



// TODO: rev esta impl de servicio de OpenAI
// import OpenAI from 'openai';
// import logger from '../../../features/logger/logger';
// import { EnvironmentVariables } from "../../../shared/EnvironmentVariables";

// class OpenAiService {

//     private logger = logger.child({ label: this.constructor.name });
    
//     private apiKey: string;
//     private openai: OpenAI;

//     constructor() {
//         this.apiKey = EnvironmentVariables.get().external_services.open_ai.api_key;
//         this.openai = new OpenAI({ apiKey: this.apiKey });
//     }


//     async getEmbedding(text: string): Promise<number[]> {
//         try {
//            const embedding = await this.openai.embeddings.create(
//                {
//                    input: text,
//                    model: "text-embedding-ada-002"
//                }
//            )
//            return embedding.data[0].embedding;
//         } catch (error) {
//             this.logger.error(`Error using OpenAI Embeddings API: ${error}`);
//             throw error;
//         }

//     }
// }

// export const openAiService = new OpenAiService();