import { IBrandDto } from "@/lib/backend/dtos/brand.dto.interface";
import { IListProductResponseDto } from "@/lib/backend/dtos/listProductResponse.dto.interface";
import { IBrand } from "@/lib/backend/models/interfaces/brand.interface";
import { IBrandCredits } from "@/lib/backend/models/interfaces/IBrandCredits";
import { IPromotion, IPromotionAdmin } from "@/lib/backend/models/interfaces/IPromotion";
import { baseFetcher, fetcher } from "@/lib/fetcher/fetchWrapper";

const BRANDS_PATH : string = `/brands`;
const ADMIN_BRANDS_PATH : string = `/admin/brands`;
const CREDITS_PATH: (brandId: string) => string = (brandId: string) => `/brands/${brandId}/credits`;

class PublicBrandsApiWrapper {

    async getBrandById(id: string): Promise<IBrand | null> {
        const [error, brand] = await fetcher(`${BRANDS_PATH}/${id}`);
        if (error) {
            console.error(`Error fetching brand by id ${id}: ${error}`);
            return null;
        }
        return brand as IBrand;
    }
}

class PrivateBrandsApiWrapper {

    //TODO: implement and try

    async createBrand(auth_token: string, brand: IBrandDto): Promise<IBrand | null> {
        const [error, createdBrand] = await fetcher(`${BRANDS_PATH}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${auth_token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(brand),
        });
        if (error) {
            console.error(`Error creating brand: ${error}`);
            return null;
        }
        return createdBrand as IBrand;
    }

    async getMyBrand(auth_token: string): Promise<IBrand | null> {
        const [error, brand] = await fetcher(`${BRANDS_PATH}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${auth_token}`,
            },
        });
        if (error) {
            console.error(`Error listing brands: ${error}`);
            return null;
        }
        return brand as IBrand;
    }

    async listAllBrands(auth_token: string): Promise<IBrand[]> {
        const [error, brands] = await fetcher(`${BRANDS_PATH}/all`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${auth_token}`,
            },
        });
        if (error) {
            console.error(`Error listing brands: ${error}`);
            return [];
        }
        return brands as IBrand[];
    }


    async updateBrand(auth_token: string, id: string, updated_brand: IBrandDto): Promise<IBrand | null> {
        delete (updated_brand as any).status;
        delete (updated_brand as any).id;
        const [error, updatedBrand] = await fetcher(`${BRANDS_PATH}/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${auth_token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updated_brand),
        });
        if (error) {
            console.error(`Error updating brand ${id}: ${error}`);
            return null;
        }
        return updatedBrand as IBrand;
    }

    async deleteBrand(auth_token: string, id: string): Promise<void> {
        const [error] = await fetcher(`${BRANDS_PATH}/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${auth_token}`,
            },
        });
        if (error) {
            console.error(`Error deleting brand ${id}: ${error}`);
        }
    }

    async changeBrandStatus(auth_token: string, id: string, status: string): Promise<IBrand | null> {
        const [error, updatedBrand] = await fetcher(`${BRANDS_PATH}/${id}/status`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${auth_token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status }),
        });
        if (error) {
            console.error(`Error changing status for brand ${id}: ${error}`);
            return null;
        }
        return updatedBrand as IBrand;
    }

    async getBrandProductsAsPrivilegedUser(auth_token: string, brandId: string, includeCategories: boolean = false): Promise<IListProductResponseDto | null> {
        const queryParams = includeCategories ? '?includeCategories=true' : '';
        const [error, products] = await fetcher(`${ADMIN_BRANDS_PATH}/${brandId}/products${queryParams}`,{
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${auth_token}`,
            },
        });
        if (error) {
            console.error(`Error fetching products by brand id ${brandId}: ${error}`);
            return null;
        }
        return products as IListProductResponseDto;
    }

    async getBrandCredits(auth_token: string, brandId: string): Promise<IBrandCredits | null> {
        const [error, credits] = await fetcher(`${CREDITS_PATH(brandId)}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${auth_token}`,
            },
        });
        if (error) {
            console.error(`Error fetching credits for brand ${brandId}: ${error}`);
            return null;
        }
        return credits as IBrandCredits;
    }

    async addBrandCredits(auth_token: string, brandId: string, credits: number): Promise<IBrandCredits | null> {
        const [error, credits_response] = await fetcher(`${CREDITS_PATH(brandId)}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${auth_token}`,
            },
            body: JSON.stringify({ add_credits: credits }),
        });
        if (error) {
            console.error(`Error adding credits for brand ${brandId}: ${error}`);
            return null;
        }
        return credits_response as IBrandCredits;
    }

    async removeBrandCredits(auth_token: string, brandId: string, credits: number): Promise<IBrandCredits | null> {
        const [error, credits_response] = await fetcher(`${CREDITS_PATH(brandId)}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${auth_token}`,
            },
            body: JSON.stringify({ remove_credits: credits }),
        });
        if (error) {
            console.error(`Error removing credits for brand ${brandId}: ${error}`);
            return null;
        }
        return credits_response as IBrandCredits;
    }

    async getBrandPromotions(auth_token: string, brandId: string): Promise<IPromotion[] | null> {
        const [error, promotions] = await fetcher(`${BRANDS_PATH}/${brandId}/promotions`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${auth_token}`,
            },
        });
        if (error) {
            console.error(`Error fetching promotions for brand ${brandId}: ${error}`);
            return null;
        }
        return promotions as IPromotion[];
    }

    async getProductPromotion(auth_token: string, brandId: string, promotionId: number): Promise<IPromotionAdmin | null> {
        const [error, promotion] = await fetcher(`${BRANDS_PATH}/${brandId}/promotions/${promotionId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${auth_token}`,
            },
        });
        if (error) {
            console.error(`Error fetching promotion for promotion ${promotionId}: ${error}`);
            return null;
        }
        return promotion as IPromotionAdmin;
    }

    async stopPromotion(auth_token: string, brandId: string, promotion_id: number): Promise<{success: boolean} | null> {
        const [error, promotion_response] = await fetcher(`${BRANDS_PATH}/${brandId}/promotions/${promotion_id}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${auth_token}`,
            },
        });
        if(error){
            console.error(`Error stopping promotion. [promotion_id: ${promotion_id}]`, error);
            return null;
        }
        return {success: true};
    }
}

export const publicBrandsApiWrapper = new PublicBrandsApiWrapper();
export const privateBrandsApiWrapper = new PrivateBrandsApiWrapper();
