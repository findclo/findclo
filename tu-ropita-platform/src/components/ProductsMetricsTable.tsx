"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { IProductMetric } from "@/lib/backend/models/interfaces/metrics/product.metric.interface"
import { IProduct } from "@/lib/backend/models/interfaces/product.interface"
import { ArrowUpDown } from 'lucide-react'
import Image from 'next/image'
import { useMemo, useState } from 'react'

interface GroupedMetrics {
    [key: number]: {
        product: IProduct
        views: number
        clicks: number
        navigations: number
    }
}

interface ProductMetrics {
    product: IProduct
    views: number
    clicks: number
    navigations: number
    conversionRate: number
}

interface ProductsMetricsTableProps {
    metrics: IProductMetric[]
}

export default function ProductsMetricsTable({ metrics }: ProductsMetricsTableProps) {
    const [sortColumn, setSortColumn] = useState<keyof ProductMetrics>('views')
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
    const [hideDeleted, setHideDeleted] = useState(true)

    const groupedMetrics: GroupedMetrics = useMemo(() => {
        return metrics.reduce((acc, metric) => {
            if (!acc[metric.product.id]) {
                acc[metric.product.id] = {
                    product: metric.product,
                    views: 0,
                    clicks: 0,
                    navigations: 0
                }
            }

            switch (metric.interaction) {
                case 'view_in_listing_related':
                    acc[metric.product.id].views += Number(metric.count) || 0;
                    break;
                case 'click':
                    acc[metric.product.id].clicks += Number(metric.count) || 0;
                    break;
                case 'navigate_to_brand_site':
                    acc[metric.product.id].navigations += Number(metric.count) || 0;
                    break;
            }

            return acc;
        }, {} as GroupedMetrics)
    }, [metrics])

    const productMetrics: ProductMetrics[] = useMemo(() => {
        return Object.values(groupedMetrics).map(({ product, views, clicks, navigations }) => ({
            product,
            views: Number(views) || 0,
            clicks: Number(clicks) || 0,
            navigations: Number(navigations) || 0,
            conversionRate: views > 0 ? (Number(clicks) / Number(views)) * 100 : 0
        }))
    }, [groupedMetrics])

    const filteredAndSortedProductMetrics = useMemo(() => {
        let filtered = [...productMetrics]
        if (hideDeleted) {
            filtered = filtered.filter(({ product }) => product.status !== 'DELETED')
        }
        
        return filtered.sort((a, b) => {
            if (sortColumn === 'product') {
                return sortDirection === 'asc' 
                    ? a.product.name.localeCompare(b.product.name)
                    : b.product.name.localeCompare(a.product.name);
            }
            
            const aValue = a[sortColumn];
            const bValue = b[sortColumn];
            
            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
            }
            
            return 0;
        })
    }, [productMetrics, sortColumn, sortDirection, hideDeleted])

    const handleSort = (column: keyof ProductMetrics) => {
        if (column === sortColumn) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
        } else {
            setSortColumn(column)
            setSortDirection('desc')
        }
    }

    return (
        <Card className="w-full overflow-auto">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>Métricas de Productos</CardTitle>
                    <div className="flex items-center space-x-2">
                        <Switch
                            id="hide-deleted"
                            checked={hideDeleted}
                            onCheckedChange={setHideDeleted}
                        />
                        <Label htmlFor="hide-deleted">Ocultar productos eliminados</Label>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[300px]">Producto</TableHead>
                                <TableHead className="text-center">Estado</TableHead>
                                <TableHead className="text-center">
                                    <Button variant="ghost" onClick={() => handleSort('views')} className="w-full justify-center">
                                        Vistas
                                        <ArrowUpDown className="ml-2 h-4 w-4" />
                                    </Button>
                                </TableHead>
                                <TableHead className="text-center">
                                    <Button variant="ghost" onClick={() => handleSort('clicks')} className="w-full justify-center">
                                        Clics
                                        <ArrowUpDown className="ml-2 h-4 w-4" />
                                    </Button>
                                </TableHead>
                                <TableHead className="text-center">
                                    <Button variant="ghost" onClick={() => handleSort('navigations')} className="w-full justify-center">
                                        Navegaciones
                                        <ArrowUpDown className="ml-2 h-4 w-4" />
                                    </Button>
                                </TableHead>
                                <TableHead className="text-center">
                                    <Button variant="ghost" onClick={() => handleSort('conversionRate')} className="w-full justify-center">
                                        Tasa de Conversión
                                        <ArrowUpDown className="ml-2 h-4 w-4" />
                                    </Button>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredAndSortedProductMetrics.map(({ product, views, clicks, navigations, conversionRate }) => (
                                <TableRow key={product.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-16 h-16 relative">
                                                <Image
                                                    src={product.images[0]}
                                                    alt={product.name}
                                                    fill
                                                    style={{ objectFit: 'cover' }}
                                                    className="rounded-md"
                                                />
                                            </div>
                                            <div>
                                                <div className="font-bold">{product.name}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {(() => {
                                            switch (product.status) {
                                                case 'DELETED':
                                                    return (
                                                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                                            Eliminado
                                                        </span>
                                                    );
                                                case 'PAUSED':
                                                    return (
                                                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                                            Pausado
                                                        </span>
                                                    );
                                                case 'PAUSED_BY_ADMIN':
                                                    return (
                                                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                                                            Pausado por Admin
                                                        </span>
                                                    );
                                                case 'ACTIVE':
                                                default:
                                                    return (
                                                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                                            Activo
                                                        </span>
                                                    );
                                            }
                                        })()}
                                    </TableCell>
                                    <TableCell className="text-center">{Number(views).toString()}</TableCell>
                                    <TableCell className="text-center">{Number(clicks).toString()}</TableCell>
                                    <TableCell className="text-center">{Number(navigations).toString()}</TableCell>
                                    <TableCell className="text-center">{Number(conversionRate).toFixed(2)}%</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}