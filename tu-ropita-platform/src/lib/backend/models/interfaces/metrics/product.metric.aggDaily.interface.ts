import {IProductMetric} from "@/lib/backend/models/interfaces/metrics/product.metric.interface";

export interface IProductMetricAggDaily extends IProductMetric{
    date: Date;
}