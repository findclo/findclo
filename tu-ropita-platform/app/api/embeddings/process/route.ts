import { embeddingProcessorService } from "@/lib/backend/services/embeddingProcessor.service";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { batchSize = 10, productId } = body;

        let result;

        if (productId) {
            // Process specific product
            console.log(`Processing embedding for specific product: ${productId}`);
            const success = await embeddingProcessorService.generateEmbeddingForProduct(parseInt(productId));
            
            result = {
                success,
                message: success 
                    ? `Successfully processed embedding for product ${productId}`
                    : `Failed to process embedding for product ${productId}`,
                processedCount: success ? 1 : 0
            };
        } else {
            // Process batch
            console.log(`Processing batch of embeddings (size: ${batchSize})`);
            const processedCount = await embeddingProcessorService.processProductsEmbeddings(batchSize);
            
            result = {
                success: true,
                message: `Processed ${processedCount} product embeddings`,
                processedCount
            };
        }

        return new Response(JSON.stringify(result), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });

    } catch (error: any) {
        console.error('Error in embeddings processing:', error);
        
        return new Response(JSON.stringify({
            success: false,
            error: error.message || 'Unknown error',
            processedCount: 0
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
}