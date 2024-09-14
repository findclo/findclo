import { IBrand } from "@/lib/backend/models/interfaces/brand.interface";
import { fetcher } from "@/lib/fetcher/fetchWrapper";

class BrandsApiWrapper {

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

export const brandsApiWrapper = new BrandsApiWrapper();