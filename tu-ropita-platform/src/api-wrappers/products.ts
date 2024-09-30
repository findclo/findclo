import { IListProductResponseDto } from "@/lib/backend/dtos/listProductResponse.dto.interface";
import { IProduct } from "@/lib/backend/models/interfaces/product.interface";
import { fetcher } from "@/lib/fetcher/fetchWrapper";

class PublicProductsApiWrapper {

    private PRODUCTS_PATH = `/products`;

    async getProductById(productId: string) {
        const queryParams = new URLSearchParams({ productId });
        const [error, response_of_product] = await fetcher(`${this.PRODUCTS_PATH}?${queryParams}`);
        if (error || !response_of_product.products || response_of_product.products.length === 0) {
            console.error(`Error fetching product by id ${productId}: ${error}`);
            return null;
        }
        return response_of_product.products[0] as IProduct;
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
        // return null;
        return this.getFilteredProducts("", { featured: true });
    }
}

class PrivateProductsApiWrapper {

    //TODO: implement private (admin/brand) products api wrapper

    async deleteProduct(auth_token: string, id: string): Promise<void> {
        //TODO: implement call
    }

    async updateProduct(auth_token: string, id: string, updated_product: IProduct): Promise<IProduct | null> {
        //TODO: implement call
        return null;
    }

    async changeProductStatus(auth_token: string, id: string, status: string): Promise<IProduct | null> {
        //TODO: implement
        return null;
    }
    
    

}

export const publicProductsApiWrapper = new PublicProductsApiWrapper();
export const privateProductsApiWrapper = new PrivateProductsApiWrapper();