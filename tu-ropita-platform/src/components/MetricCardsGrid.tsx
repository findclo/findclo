import MetricCard from "@/components/MetricCard";
import { IMetrics } from "@/lib/backend/models/interfaces/metrics/metric.interface";
import { ProductInteractionEnum } from "@/lib/backend/models/interfaces/metrics/productInteraction.interface";

interface MetricCardsGridProps {
    data: IMetrics[]
}
const cardsConfig = {
    [ProductInteractionEnum.VIEW_IN_LISTING_RELATED]: {
        label: 'Vistas en listado relacionado',
    },
    [ProductInteractionEnum.VIEW_IN_LISTING_PROMOTED]: {
        label: 'Vistas en listado promocionado',
    },
    [ProductInteractionEnum.CLICK]: {
        label: 'Clics',
    },
    [ProductInteractionEnum.NAVIGATE_TO_BRAND_SITE]: {
        label: 'Navegaciones al sitio de la marca',
    }
};
export default function MetricCardsGrid({ data }: MetricCardsGridProps) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
            {Object.entries(cardsConfig).map(([metric, config]) => {
                const metricData = data.find(d => d.interaction === metric)
                return (
                    <MetricCard
                        key={metric}
                        metric={metric as ProductInteractionEnum}
                        count={metricData ? metricData.count : 0}
                        label={config.label}
                    />
                )
            })}
        </div>
    )
}