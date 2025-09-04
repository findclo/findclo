import { imageStorageService } from '@/lib/backend/services/imageStorage.service';
import { productRepository } from '@/lib/backend/persistance/products.repository';

class BlobImageProcessorService {
    
    public async processUnuploadedProducts(limit: number = 10): Promise<number> {
        try {
            const products = await productRepository.getUnuploadedProducts(limit);
            let processedCount = 0;

            for (const product of products) {
                try {
                    console.log(`Processing images for product ${product.id}: ${product.name}`);
                    
                    if (!product.images || product.images.length === 0) {
                        await productRepository.markAsUploadedToBlob(product.id);
                        processedCount++;
                        continue;
                    }

                    const imageUrls = Array.isArray(product.images) ? product.images : [product.images];
                    const validImageUrls = imageUrls.filter(url => this.isValidUrl(url));
                    
                    if (validImageUrls.length === 0) {
                        await productRepository.markAsUploadedToBlob(product.id);
                        processedCount++;
                        continue;
                    }

                    const processedImages = await imageStorageService.uploadImagesFromUrls(
                        validImageUrls, 
                        product.name
                    );

                    const successfulUploads = processedImages.filter((url, index) => 
                        url !== validImageUrls[index]
                    );

                    if (successfulUploads.length > 0) {
                        await productRepository.updateProductImages(product.id, successfulUploads);
                        console.log(`Successfully processed ${successfulUploads.length} images for product ${product.id}`);
                    }

                    await productRepository.markAsUploadedToBlob(product.id);
                    processedCount++;

                } catch (error) {
                    console.error(`Error processing product ${product.id}:`, error);
                }
            }

            return processedCount;
        } catch (error) {
            console.error('Error in processUnuploadedProducts:', error);
            throw error;
        }
    }

    public async resetProductImageFlag(productId: number): Promise<void> {
        try {
            await productRepository.resetUploadedToBlobFlag(productId);
            console.log(`Reset uploaded_to_blob flag for product ${productId}`);
        } catch (error) {
            console.error(`Error resetting flag for product ${productId}:`, error);
            throw error;
        }
    }

    private isValidUrl(url: string): boolean {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }
}

export const imageProcessorService: BlobImageProcessorService = new BlobImageProcessorService();