import { fetcher } from "@/lib/fetcher/fetchWrapper";
import {IProductMetricAggDaily} from "@/lib/backend/models/interfaces/productMetricAggDaily.interface";
import {formatDateYYYYMMDD} from "@/lib/utils";

const ADMIN_METRICS_PATH : string = `/admin/metrics`;
class PrivateMetricsApiWrapper {

    //TODO: implement and try

    async getMetricsAggDaily(auth_token: string, startDate: Date, endDate : Date): Promise<IProductMetricAggDaily[]> {
        const [error, metrics] = await fetcher(`${ADMIN_METRICS_PATH}/daily?startDate=${formatDateYYYYMMDD(startDate)}&endDate=${formatDateYYYYMMDD(endDate)}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${auth_token}`,
                'Content-Type': 'application/json',
            },
        })
        if (error) {
            console.error(`Error getting metrics: ${error}`);
            return [];
        }
        console.log(metrics)
        return metrics as IProductMetricAggDaily[];
    }

}

export const privateMetricsApiWrapper = new PrivateMetricsApiWrapper();