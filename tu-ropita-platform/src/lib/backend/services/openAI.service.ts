import { IAIService } from "@/lib/backend/services/interfaces/AI.service.interface";
import settings from "@/lib/settings";
import OpenAI from "openai";

class OpenAIService implements IAIService{
    openai = new OpenAI({
        apiKey: settings.OPEN_AI.API_KEY,
    });


    async getProductTagsFromGPT(description: string): Promise<string[]> {
        try {
            const response = await this.openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: "Eres un asistente que extrae etiquetas relevantes de descripciones de productos en español. Las etiquetas deben estar relacionadas con el tipo de producto, material, color y estilo, y deben ser devueltas en el siguiente formato: Categoría: Valor. Si hay valores repetidos para una misma categoría, cada valor debe aparecer en la misma linea, separados por una coma (,)" },
                    { role: "user", content: `Extrae etiquetas relevantes de esta descripción de producto en español: "${description}". Las etiquetas deben estar relacionadas con el tipo de producto, material, color y estilo, y deben ser devueltas en el formato: Categoría: Valor. Devuelve toda la respuesta en una misma linea separados los valores por una coma (,). Si un valor se repite en una categoría, debe repetirse la categoria con el mismo valor. Las categorias pueden repertirse N veces.` }
                ],
                temperature: 0.7,
            });

            // Procesar la respuesta para el formato requerido
            const messageContent = response.choices[0]?.message?.content;

            if (messageContent) {
                console.log(messageContent)
                messageContent.replaceAll('-','');
                messageContent.replaceAll('\'','');
                messageContent.replaceAll('\"','');
                const lines = messageContent.trim().split('\n');
                const formattedTags: string[] = [];

                lines.forEach(line => {
                    const [category, ...values] = line.split(':');
                    values.forEach(value => {
                        formattedTags.push(`${category.trim()}: ${value.trim()}`);
                    });
                });

                return formattedTags;
            } else {
                throw new Error("No se recibió contenido de GPT-3.5");
            }
        } catch (error) {
            console.error('Error fetching tags from GPT-3.5:', error);
            throw error;
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

//     async runAssistant(assistant_id: string, prompt: string): Promise<string> {

//         try {
//             this.logger.info(`Running OpenAI assistant. [assistant_id=${assistant_id}]`);
//             const thread = await this.openai.beta.threads.create();
//             await this.openai.beta.threads.messages.create(thread.id, {
//                 role: "user",
//                 content: prompt
//             });

//             const run = await this.openai.beta.threads.runs.create(thread.id, {
//                 assistant_id: assistant_id,
//             });
//             let runStatus = await this.openai.beta.threads.runs.retrieve(thread.id, run.id);
//             while (runStatus.status !== 'completed') {
//                 await new Promise(resolve => setTimeout(resolve, 1000));
//                 runStatus = await this.openai.beta.threads.runs.retrieve(thread.id, run.id);
//                 this.logger.info(`Assistant run status: ${runStatus.status}`);
//             }

//             const messages = await this.openai.beta.threads.messages.list(thread.id);
//             const assistantMessages = messages.data.filter(message => message.role === 'assistant');
//             const lastMessage = assistantMessages[assistantMessages.length - 1];
//             if (lastMessage && lastMessage.content.length > 0) {
//                 const content = lastMessage.content[0];
//                 if (content.type === 'text') {
//                     return content.text.value;
//                 } else {
//                     throw new Error("The assistant's response was not in text format.");
//                 }
//             } else {
//                 throw new Error("No response from the assistant.");
//             }

//         } catch (error) {
//             this.logger.error(`Error using OpenAI Assistants API: ${error}`);
//             throw error;
//         }
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