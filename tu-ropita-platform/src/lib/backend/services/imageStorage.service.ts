import { put } from '@vercel/blob';
import { settings } from '@/lib/settings';

export interface IImageStorageService {
    uploadImagesFromUrls(imageUrls: string[], productName: string): Promise<string[]>;
}

class ImageStorageService implements IImageStorageService {
    
    public async uploadImagesFromUrls(imageUrls: string[], productName: string): Promise<string[]> {
        if (!imageUrls || imageUrls.length === 0) {
            return [];
        }

        const uploadPromises = imageUrls.map(async (url, index) => {
            try {
                return await this.uploadSingleImageFromUrl(url, productName, index);
            } catch (error) {
                console.error(`Failed to upload image ${url}:`, error);
                return url;
            }
        });

        return Promise.all(uploadPromises);
    }

    private async uploadSingleImageFromUrl(imageUrl: string, productName: string, index: number): Promise<string> {
        if (!this.isValidUrl(imageUrl)) {
            throw new Error(`Invalid URL: ${imageUrl}`);
        }

        const response = await fetch(imageUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type');
        if (!this.isSupportedImageType(contentType)) {
            throw new Error(`Unsupported image type: ${contentType}`);
        }

        const imageBuffer = await response.arrayBuffer();
        const fileExtension = this.getFileExtensionFromContentType(contentType);
        const sanitizedProductName = this.sanitizeFileName(productName);
        const fileName = `products/${sanitizedProductName}/${Date.now()}-${index}.${fileExtension}`;

        const blob = await put(fileName, imageBuffer, {
            access: 'public',
            addRandomSuffix: true,
            contentType: contentType || 'image/jpeg',
        });

        return blob.url;
    }

    private isValidUrl(url: string): boolean {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    private isSupportedImageType(contentType: string | null): boolean {
        if (!contentType) return false;
        const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        return supportedTypes.includes(contentType.toLowerCase());
    }

    private getFileExtensionFromContentType(contentType: string | null): string {
        if (!contentType) return 'jpg';
        const extensionMap: Record<string, string> = {
            'image/jpeg': 'jpg',
            'image/jpg': 'jpg', 
            'image/png': 'png',
            'image/gif': 'gif',
            'image/webp': 'webp'
        };
        return extensionMap[contentType.toLowerCase()] || 'jpg';
    }

    private sanitizeFileName(fileName: string): string {
        return fileName
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '')
            .substring(0, 50);
    }
}

export const imageStorageService: ImageStorageService = new ImageStorageService();