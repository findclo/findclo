import { IListProductResponseDto } from "@/lib/backend/dtos/listProductResponse.dto.interface";
import { IProduct } from "@/lib/backend/models/interfaces/product.interface";
import { fetcher } from "@/lib/fetcher/fetchWrapper";

class ProductsApiWrapper {

    private PRODUCTS_PATH = `/products`;

    async getProductById(productId: string) {
        const queryParams = new URLSearchParams({ productId });
        const [error, product] = await fetcher(`${this.PRODUCTS_PATH}?${queryParams}`);
        if (error) {
            console.error(`Error fetching product by id ${productId}: ${error}`);
            return null;
        }
        return product as IProduct;
    }

    async getProductsByBrandId(brandId: string): Promise<IListProductResponseDto | null> {
        const queryParams = new URLSearchParams({ brandId });
        const [error, products] = await fetcher(`${this.PRODUCTS_PATH}?${queryParams}`);
        if (error) {
            console.error(`Error fetching products by brand id ${brandId}: ${error}`);
            return null;
        }
        return products as IListProductResponseDto;
    }

    async getFilteredProducts(query: string, filters: any): Promise<IListProductResponseDto | null> {
        const queryParams = new URLSearchParams({ search: query, ...filters });
        const [error, products] = await fetcher(`${this.PRODUCTS_PATH}?${queryParams}`);
        if (error) {
            console.error(`Error fetching filtered products: ${error}`);
            return null;
        }
        return products as IListProductResponseDto;
    }

    async getFeaturedProducts(): Promise<IListProductResponseDto | null> {
        //TODO: 'featured' query param not implemented yet
        return this.getFilteredProducts("", { featured: true });
    }
}

export const productsApiWrapper = new ProductsApiWrapper();