import { IListProductResponseDto } from "@/lib/backend/dtos/listProductResponse.dto.interface";
import globalSettings from "@/lib/settings";

class ProductsApiWrapper {

    private API_BASE_URL = `${globalSettings.BASE_URL}/api`;
    private PRODUCTS_PATH = `/products`;

    async getProductById(productId: string) {
        const res = await fetch(`${this.API_BASE_URL}${this.PRODUCTS_PATH}?productId=${productId}`, { cache: 'no-store' });
        if (!res.ok) {
            throw new Error('Failed to fetch product');
        }
        return res.json();
    }

    async getProductsByBrandId(brandId: string): Promise<IListProductResponseDto> {
        const queryParams = new URLSearchParams({ brandId: brandId });
        const res = await fetch(`${this.API_BASE_URL}${this.PRODUCTS_PATH}?${queryParams}`, { cache: 'no-store' });
        if (!res.ok) {
            throw new Error('Failed to fetch products');
        }
        return res.json();
    }

    async getFilteredProducts(query: string, filters: any): Promise<IListProductResponseDto> {
        const queryParams = new URLSearchParams({ search: query, ...filters });
        const res = await fetch(`${this.API_BASE_URL}${this.PRODUCTS_PATH}?${queryParams}`, { cache: 'no-store' });
        if (!res.ok) {
            throw new Error('Failed to fetch products');
        }
        return res.json();
    }

    async getFeaturedProducts(): Promise<IListProductResponseDto> {
        const res = await this.getFilteredProducts("", { featured: true });
        return res;
    }

}

export const productsApiWrapper = new ProductsApiWrapper();