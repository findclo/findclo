import { fetcher } from "@/lib/fetcher/fetchWrapper";
import {formatDateYYYYMMDD} from "@/lib/utils";
import {IMetrics} from "@/lib/backend/models/interfaces/metrics/metric.interface";
import {IProductMetric} from "@/lib/backend/models/interfaces/metrics/product.metric.interface";

const ADMIN_METRICS_PATH : string = `/admin/metrics`;
const SHOP_ADMIN_METRICS_PATH : string = `/brands`;
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
    private async fetchMetrics(auth_token: string, path: string, startDate: Date, endDate: Date, brandId?:string): Promise<any[]> {
        let url = `${path}?startDate=${formatDateYYYYMMDD(startDate)}&endDate=${formatDateYYYYMMDD(endDate)}`;
        if (brandId) {
            url += `&brand=${brandId}`;
        }
        console.log(url)
        const [error, metrics] = await fetcher(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${auth_token}`,
                'Content-Type': 'application/json',
            },
        });
        if (error) {
            console.error(`Error getting metrics: ${error}`);
            return [] as any[];
        }
        return metrics as any[];
    }

    async getMetrics(auth_token: string, startDate: Date, endDate: Date, brandId? : string): Promise<IMetrics[]> {
        return this.fetchMetrics(auth_token, ADMIN_METRICS_PATH, startDate, endDate,brandId);
    }

    async getMetricsAggDaily(auth_token: string, startDate: Date, endDate: Date, brandId? : string ): Promise<IMetrics[]> {
        return this.fetchMetrics(auth_token, `${ADMIN_METRICS_PATH}/daily`, startDate, endDate,brandId);
    }

    async getProductsMetrics(auth_token: string, startDate: Date, endDate: Date, brandId? : string): Promise<IProductMetric[]> {
        return this.fetchMetrics(auth_token, `${ADMIN_METRICS_PATH}/products`, startDate, endDate,brandId);
    }

    async getBrandMetrics(auth_token: string, startDate: Date, endDate: Date, brandId : string): Promise<IMetrics[]> {
        return this.fetchMetrics(auth_token, `${this.getBrandsPath(brandId)}`, startDate, endDate,brandId);
    }

    async getBrandMetricsAggDaily(auth_token: string, startDate: Date, endDate: Date, brandId : string ): Promise<IMetrics[]> {
        return this.fetchMetrics(auth_token, `${this.getBrandsPath(brandId)}/daily`, startDate, endDate,brandId);
    }

    async getBrandsProductsMetrics(auth_token: string, startDate: Date, endDate: Date, brandId : string): Promise<IProductMetric[]> {
        return this.fetchMetrics(auth_token, `${this.getBrandsPath(brandId)}/products`, startDate, endDate,brandId);
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


    private getBrandsPath(brandId: string): string {
        return `${SHOP_ADMIN_METRICS_PATH}/${brandId}/metrics`;
    }

}
export const publicMetricsApiWrapper = new PublicMetricsApiWrapper();

export const privateMetricsApiWrapper = new PrivateMetricsApiWrapper();