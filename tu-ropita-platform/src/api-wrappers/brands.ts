import { IBrand } from "@/lib/backend/models/interfaces/brand.interface";
import { fetcher } from "@/lib/fetcher/fetchWrapper";

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

    async createBrand(brand: IBrand): Promise<IBrand | null> {
        //TODO: implement
        return null;
    }

    async updateBrand(id: string, updated_brand: IBrand): Promise<IBrand | null> {
        //TODO: implement
        return null;
    }

    async deleteBrand(id: string): Promise<void> {
        //TODO: implement
    }

    async listBrands(): Promise<IBrand[]> {
        //TODO: implement
        return [];
    }

    async changeBrandStatus(id: string, status: string): Promise<IBrand | null> {
        //TODO: implement
        return null;
    }
   
}

export const publicBrandsApiWrapper = new PublicBrandsApiWrapper();
export const privateBrandsApiWrapper = new PrivateBrandsApiWrapper();