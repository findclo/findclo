import { IBill } from "@/lib/backend/models/interfaces/IBill";
import { fetcher } from "@/lib/fetcher/fetchWrapper";

const ADMIN_BILLS_PATH: string = `/admin/bills`;
const BRANDS_BILLS_PATH: string = `/brands`;

class PrivateBillsApiWrapper {
    async getBills(auth_token: string, period:string): Promise<IBill[]> {
        const [error, bills] = await fetcher(`${ADMIN_BILLS_PATH}?period=${period}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${auth_token}`,
                'Content-Type': 'application/json',
            },
        });

        if (error) {
            console.error(`Error getting bills: ${error}`);
            throw error;
        }

        return bills as IBill[];
    }

    async changeBillStatus(auth_token: string, billId: number): Promise<void> {
        const [error, _] = await fetcher(`${ADMIN_BILLS_PATH}/${billId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${auth_token}`,
                'Content-Type': 'application/json',
            },
        });

        if (error) {
            console.error(`Error changing bill status: ${error}`);
            throw error;
        }
    }
}

class PrivateBrandsBillsApiWrapper {
    async getBrandBills(auth_token: string, brandId: string): Promise<IBill[]> {
        const [error, bills] = await fetcher(`${BRANDS_BILLS_PATH}/${brandId}/bills`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${auth_token}`,
                'Content-Type': 'application/json',
            },
        });

        if (error) {
            console.error(`Error getting brand bills: ${error}`);
            throw error;
        }

        return bills as IBill[];
    }
}

export const privateBillsApiWrapper = new PrivateBillsApiWrapper();
export const privateBrandsBillsApiWrapper = new PrivateBrandsBillsApiWrapper();