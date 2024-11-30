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
}

export const privateBillsApiWrapper = new PrivateBillsApiWrapper();