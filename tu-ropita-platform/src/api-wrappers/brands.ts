import { IBrand } from "@/lib/backend/models/interfaces/brand.interface";
import { fetcher } from "@/lib/fetcher/fetchWrapper";
import {IBrandDto} from "@/lib/backend/dtos/brand.dto.interface";

class PublicBrandsApiWrapper {

    private BRANDS_PATH = `/brands`;

    async getBrandById(id: string): Promise<IBrand | null> {
        const [error, brand] = await fetcher(`${this.BRANDS_PATH}/${id}`);
        if (error) {
            console.error(`Error fetching brand by id ${id}: ${error}`);
            return null;
        }
        return brand as IBrand;
    }
}

class PrivateBrandsApiWrapper {

    //TODO: implement private (admin/brand) brands api wrapper

    async createBrand(auth_token: string, brand: IBrandDto): Promise<IBrand | null> {
        //TODO: implement call
        return null;
    }

    async updateBrand(auth_token: string, id: string, updated_brand: IBrandDto): Promise<IBrand | null> {
        //TODO: implement call
        return null;
    }

    async deleteBrand(auth_token: string, id: string): Promise<void> {
        //TODO: implement call
    }

    async listBrands(auth_token: string): Promise<IBrand[]> {
        //TODO: implement
        return [];
    }

    async changeBrandStatus(auth_token: string, id: string, status: string): Promise<IBrand | null> {
        //TODO: implement
        return null;
    }
   
}

export const publicBrandsApiWrapper = new PublicBrandsApiWrapper();
export const privateBrandsApiWrapper = new PrivateBrandsApiWrapper();