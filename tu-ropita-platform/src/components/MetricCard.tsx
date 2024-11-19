import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProductInteractionEnum } from "@/lib/backend/models/interfaces/metrics/productInteraction.interface"

interface MetricCardProps {
    metric: ProductInteractionEnum
    count: number
    label: string
}

export default function MetricCard({ metric, count, label }: MetricCardProps) {
    return (
        <Card key={metric} className="w-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{label}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">
                    {count.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Total en el periodo</p>
            </CardContent>
        </Card>
    )
}