import { fetcher } from "@/lib/fetcher/fetchWrapper";
import {IBill} from "@/lib/backend/models/interfaces/IBill";

const ADMIN_BILLS_PATH: string = `/admin/bills`;

class PrivateBillsApiWrapper {
    async getBills(auth_token: string): Promise<IBill[]> {
        const [error, bills] = await fetcher(ADMIN_BILLS_PATH, {
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
        const [error] = await fetcher(`${ADMIN_BILLS_PATH}/${billId}`, {
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

export const privateBillsApiWrapper = new PrivateBillsApiWrapper();