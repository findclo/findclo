import { IBrand } from "@/lib/backend/models/interfaces/brand.interface";
import globalSettings from "@/lib/settings";

class BrandsApiWrapper {

    private API_BASE_URL = `${globalSettings.BASE_URL}/api`;
    private BRANDS_PATH = `/brands`;

    async getBrandById(id: string): Promise<IBrand> {
        const res = await fetch(`${this.API_BASE_URL}${this.BRANDS_PATH}/${id}`, { cache: 'no-store' });
        if (!res.ok) {
            throw new Error('Failed to fetch brand');
        }
        return res.json();
    }

}

export const brandsApiWrapper = new BrandsApiWrapper();