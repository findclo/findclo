import OpenAI from "openai";
import settings from "@/lib/settings";
import {IAIService} from "@/lib/backend/services/interfaces/AI.service.interface";

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