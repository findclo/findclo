import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer } from '@/components/ui/chart'
import { ProductInteractionEnum } from "@/lib/backend/models/interfaces/metrics/productInteraction.interface"
import { RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { Area, AreaChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts'

interface MetricsChartProps {
    dailyData: Record<string, any>[]
    onRefresh: () => Promise<void>
}

export default function MetricsChart({ dailyData, onRefresh }: MetricsChartProps) {
    const chartConfig = {
        [ProductInteractionEnum.VIEW_IN_LISTING_RELATED]: {
            label: 'Vistas en listado relacionado',
            color: 'hsl(45, 100%, 51%)' // Bright yellow
        },
        [ProductInteractionEnum.VIEW_IN_LISTING_PROMOTED]: {
            label: 'Vistas en listado promocionado',
            color: 'hsl(120, 100%, 40%)' // Bright green
        },
        [ProductInteractionEnum.CLICK]: {
            label: 'Clics',
            color: 'hsl(200, 100%, 50%)' // Bright blue
        },
        [ProductInteractionEnum.NAVIGATE_TO_BRAND_SITE]: {
            label: 'Navegaciones al sitio de la marca',
            color: 'hsl(340, 100%, 50%)' // Bright pink
        }
    }

    const [visibleLines, setVisibleLines] = useState<Record<string, boolean>>(() => 
        Object.keys(chartConfig).reduce((acc, key) => ({
            ...acc,
            [key]: true
        }), {})
    )

    const getMaxValue = () => {
        return Math.ceil(Math.max(...dailyData.flatMap(entry =>
            Object.entries(entry)
                .filter(([key]) => key !== 'name' && visibleLines[key])
                .map(([_, value]) => Number(value))
        )) * 1.1)
    }

    const toggleLine = (key: string) => {
        setVisibleLines(prev => ({
            ...prev,
            [key]: !prev[key]
        }))
    }

    return (
        <Card className="mb-6 w-full">
            <CardHeader>
                <CardTitle>Evolución de Métricas</CardTitle>
                <div className="flex items-center gap-2 text-gray-600">
                    <p>Última actualización: {new Date().toLocaleString('es-AR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                    })}</p>
                    <button
                        onClick={onRefresh}
                        className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                        title="Recargar página"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="mb-4 flex flex-wrap gap-4">
                    {Object.entries(chartConfig).map(([key, config]) => (
                        <button
                            key={key}
                            onClick={() => toggleLine(key)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors ${
                                visibleLines[key] 
                                    ? 'bg-gray-100 hover:bg-gray-200' 
                                    : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                            }`}
                        >
                            <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: config.color }} 
                            />
                            {config.label}
                        </button>
                    ))}
                </div>
                <ChartContainer config={chartConfig}>
                    <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                        <defs>
                            {Object.entries(chartConfig).map(([key, config]) => (
                                <linearGradient key={key} id={`color${key}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={config.color} stopOpacity={0.8} />
                                    <stop offset="95%" stopColor={config.color} stopOpacity={0} />
                                </linearGradient>
                            ))}
                        </defs>
                        <XAxis dataKey="name" />
                        <YAxis
                            domain={[0, getMaxValue()]}
                            tickFormatter={(value) => value.toLocaleString()}
                            width={60}
                        />
                        <CartesianGrid strokeDasharray="3 3" />
                        <Tooltip />
                        {Object.entries(chartConfig).map(([key, config]) => (
                            visibleLines[key] && (
                                <Area
                                    key={key}
                                    type="monotone"
                                    dataKey={key}
                                    stroke={config.color}
                                    fillOpacity={1}
                                    fill={`url(#color${key})`}
                                />
                            )
                        ))}
                    </AreaChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}