import { openAIService } from "./openAI.service";
import { productRepository } from "../persistance/products.repository";
import { categoryRepository } from "../persistance/category.repository";

export interface IEmbeddingProcessorService {
    processProductsEmbeddings(batchSize?: number): Promise<number>;
    generateEmbeddingForProduct(productId: number): Promise<boolean>;
}

class EmbeddingProcessorService implements IEmbeddingProcessorService {
    
    private readonly THREADS = 10;

    async processProductsEmbeddings(batchSize: number = 10): Promise<number> {
        console.log(`Starting embedding processing batch (size: ${batchSize}) with 4 parallel threads`);
        
        try {
            const products = await productRepository.getProductsWithoutEmbedding(batchSize);
            console.log(`Processing ${products.length} products for embeddings`);
            
            if (products.length === 0) {
                console.log('No products to process');
                return 0;
            }

            const chunkSize = Math.ceil(products.length / this.THREADS);
            const chunks = this.chunkArray(products, chunkSize);
            
            console.log(`Divided ${products.length} products into ${chunks.length} chunks of max ${chunkSize} products each`);
            
            const chunkPromises = chunks.map((chunk, index) => 
                this.processChunk(chunk, index + 1)
            );
            
            const results = await Promise.allSettled(chunkPromises);
            
            let totalProcessedCount = 0;
            results.forEach((result, index) => {
                if (result.status === 'fulfilled') {
                    totalProcessedCount += result.value;
                    console.log(`Thread ${index + 1} completed: ${result.value} products processed`);
                } else {
                    console.error(`Thread ${index + 1} failed:`, result.reason);
                }
            });
            
            console.log(`Successfully processed ${totalProcessedCount}/${products.length} product embeddings across all threads`);
            return totalProcessedCount;
        } catch (error) {
            console.error('Error in batch embedding processing:', error);
            throw error;
        }
    }

    private chunkArray<T>(array: T[], chunkSize: number): T[][] {
        const chunks: T[][] = [];
        for (let i = 0; i < array.length; i += chunkSize) {
            chunks.push(array.slice(i, i + chunkSize));
        }
        return chunks;
    }

    private async processChunk(products: any[], threadNumber: number): Promise<number> {
        console.log(`Thread ${threadNumber} starting with ${products.length} products`);
        let processedCount = 0;
        
        for (const product of products) {
            try {
                const success = await this.generateEmbeddingForProduct(product.id);
                if (success) {
                    processedCount++;
                }
            } catch (error) {
                console.error(`Thread ${threadNumber} - Failed to process embedding for product ${product.id}:`, error);
            }
        }
        
        console.log(`Thread ${threadNumber} completed: ${processedCount}/${products.length} products processed`);
        return processedCount;
    }

    async generateEmbeddingForProduct(productId: number): Promise<boolean> {
        try {
            const product = await productRepository.getProductById(productId, false);
            const categories = await categoryRepository.getProductCategories(productId);
            
            if (!product || !product.name || product.name.trim().length === 0) {
                return false;
            }

            const textForEmbedding = [
                'Nombre producto: ',
                product.name,
                'Descripción: ',
                product.description || '',
                'Marca: ',
                product.brand?.name || '',
                'Categorías: ',
                categories.map(category => category.name).join(', '),
            ].filter(text => text && text.trim().length > 0)
             .join(' ');

            if (textForEmbedding.trim().length === 0) {
                return false;
            }

            console.log(`Generating embedding for product ${productId}: "${textForEmbedding.substring(0, 100)}..."`);
            
            const embedding = await openAIService.createEmbedding(textForEmbedding);
            
            if (!embedding || embedding.length === 0) {
                console.error(`Failed to generate embedding for product ${productId}`);
                return false;
            }

            await productRepository.updateProductEmbedding(productId, embedding);
            console.log(`Successfully updated embedding for product ${productId}`);
            
            return true;
            
        } catch (error) {
            console.error(`Error generating embedding for product ${productId}:`, error);
            return false;
        }
    }
}

export const embeddingProcessorService = new EmbeddingProcessorService();