import { fetcher } from "@/lib/fetcher/fetchWrapper";
import {formatDateYYYYMMDD} from "@/lib/utils";
import {IMetrics} from "@/lib/backend/models/metric.interface";

const ADMIN_METRICS_PATH : string = `/admin/metrics`;
class PrivateMetricsApiWrapper {

    //TODO: implement and try

    async getMetricsAggDaily(auth_token: string, startDate: Date, endDate : Date): Promise<IMetrics[]> {
        const [error, metrics] = await fetcher(`${ADMIN_METRICS_PATH}/daily?startDate=${formatDateYYYYMMDD(startDate)}&endDate=${formatDateYYYYMMDD(endDate)}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${auth_token}`,
                'Content-Type': 'application/json',
            },
        })
        if (error) {
            console.error(`Error getting metrics: ${error}`);
            return [] as IMetrics[];
        }
        console.log(metrics)
        return metrics as IMetrics[];
    }

}

export const privateMetricsApiWrapper = new PrivateMetricsApiWrapper();