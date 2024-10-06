import { IListProductResponseDto } from "@/lib/backend/dtos/listProductResponse.dto.interface";
import { IProductDTO } from "@/lib/backend/dtos/product.dto.interface";
import { IProduct } from "@/lib/backend/models/interfaces/product.interface";
import { fetcher } from "@/lib/fetcher/fetchWrapper";

const PRODUCTS_PATH : string = `/products`;

class PublicProductsApiWrapper {

    async getProductById(productId: string) {
        const queryParams = new URLSearchParams({ productId });
        const [error, response_of_product] = await fetcher(`${PRODUCTS_PATH}/${productId}`);
        if (error || !response_of_product.id ) {
            console.error(`Error fetching product by id ${productId}: ${error}`);
            return null;
        }
        return response_of_product as IProduct;
    }

    async getProductsByBrandId(brandId: string): Promise<IListProductResponseDto | null> {
        const queryParams = new URLSearchParams({ brandId });
        const [error, products] = await fetcher(`${PRODUCTS_PATH}?${queryParams}`);
        if (error) {
            console.error(`Error fetching products by brand id ${brandId}: ${error}`);
            return null;
        }
        return products as IListProductResponseDto;
    }

    async getFilteredProducts(query: string, filters: any): Promise<IListProductResponseDto | null> {
        const queryParams = new URLSearchParams({ search: query, ...filters });
        const [error, products] = await fetcher(`${PRODUCTS_PATH}?${queryParams}`);
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

// TODO IMPLEMENT AND TRY

    async deleteProduct(auth_token: string, id: string): Promise<void> {
        const response = await fetch(`${PRODUCTS_PATH}/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${auth_token}`
            }
        });

        if (!response.ok) {
            const error = await response.json();
            console.error(`Error deleting product with id ${id}:`, error);
            // TODO how do we handle?
        }
    }

    async updateProduct(auth_token: string, id: string, updated_product: IProductDTO): Promise<IProduct | null> {
        const response = await fetch(`${PRODUCTS_PATH}/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${auth_token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updated_product)
        });

        if (!response.ok) {
            const error = await response.json();
            console.error(`Error updating product with id ${id}:`, error);
            // TODO how do we handle?
            return null;
        }

        const updatedProduct = await response.json();
        return updatedProduct as IProduct;
    }

    async changeProductStatus(auth_token: string, id: string, status: string): Promise<IProduct | null> {
        const response = await fetch(`${PRODUCTS_PATH}/${id}/status`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${auth_token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status })
        });

        if (!response.ok) {
            const error = await response.json();
            console.error(`Error changing status for product with id ${id}:`, error);
            // TODO how do we handle?
            return null;
        }

        const updatedProduct = await response.json();
        return updatedProduct as IProduct;
    }
    
    

}

export const publicProductsApiWrapper = new PublicProductsApiWrapper();
export const privateProductsApiWrapper = new PrivateProductsApiWrapper();