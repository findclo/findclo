import { fetcher } from "@/lib/fetcher/fetchWrapper";
import {formatDateYYYYMMDD} from "@/lib/utils";
import {IMetrics} from "@/lib/backend/models/metric.interface";

const ADMIN_METRICS_PATH : string = `/admin/metrics`;
const PUBLIC_METRICS_PATH : string = `/metrics/products`;

class PublicMetricsApiWrapper {
    async addClickBrandInteraction(productId: string): Promise<void> {
        const [error, response] = await fetcher(`${PUBLIC_METRICS_PATH}/${productId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (error) {
            console.error(`Error adding click brand interaction: ${error}`);
            throw error;
        }
    }
}

class PrivateMetricsApiWrapper {
    private async fetchMetrics(auth_token: string, path: string, startDate: Date, endDate: Date): Promise<IMetrics[]> {
        const [error, metrics] = await fetcher(`${path}?startDate=${formatDateYYYYMMDD(startDate)}&endDate=${formatDateYYYYMMDD(endDate)}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${auth_token}`,
                'Content-Type': 'application/json',
            },
        });
        if (error) {
            console.error(`Error getting metrics: ${error}`);
            return [] as IMetrics[];
        }
        return metrics as IMetrics[];
    }

    async getMetrics(auth_token: string, startDate: Date, endDate: Date): Promise<IMetrics[]> {
        return this.fetchMetrics(auth_token, ADMIN_METRICS_PATH, startDate, endDate);
    }

    async getMetricsAggDaily(auth_token: string, startDate: Date, endDate: Date): Promise<IMetrics[]> {
        return this.fetchMetrics(auth_token, `${ADMIN_METRICS_PATH}/daily`, startDate, endDate);
    }

    async syncMetricsAggDaily(auth_token: string): Promise<void> {
        const [error, response] = await fetcher(`${ADMIN_METRICS_PATH}/daily`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${auth_token}`,
            }
        });

        if (error) {
            console.error(`Error syncing metrics: ${error}`);
            throw error;
        }

    }

}
export const publicMetricsApiWrapper = new PublicMetricsApiWrapper();

export const privateMetricsApiWrapper = new PrivateMetricsApiWrapper();