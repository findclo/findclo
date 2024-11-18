"use client"

import React, { useState, useMemo } from 'react'
import Image from 'next/image'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpDown } from 'lucide-react'
import {IProductMetric} from "@/lib/backend/models/interfaces/metrics/product.metric.interface";
import {IProduct} from "@/lib/backend/models/interfaces/product.interface";

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
                    acc[metric.product.id].views += metric.count
                    break
                case 'click':
                    acc[metric.product.id].clicks += metric.count
                    break
                case 'navigate_to_brand_site':
                    acc[metric.product.id].navigations += metric.count
                    break
            }

            return acc
        }, {} as GroupedMetrics)
    }, [metrics])

    const productMetrics: ProductMetrics[] = useMemo(() => {
        return Object.values(groupedMetrics).map(({ product, views, clicks, navigations }) => ({
            product,
            views,
            clicks,
            navigations,
            conversionRate: views > 0 ? (clicks / views) * 100 : 0
        }))
    }, [groupedMetrics])

    const sortedProductMetrics = useMemo(() => {
        return [...productMetrics].sort((a, b) => {
            if (a[sortColumn] < b[sortColumn]) return sortDirection === 'asc' ? -1 : 1
            if (a[sortColumn] > b[sortColumn]) return sortDirection === 'asc' ? 1 : -1
            return 0
        })
    }, [productMetrics, sortColumn, sortDirection])

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
                <CardTitle>Métricas de Productos</CardTitle>
            </CardHeader>
            <CardContent>
                <div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[300px]">Producto</TableHead>
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
                            {sortedProductMetrics.map(({ product, views, clicks, navigations, conversionRate }) => (
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
                                    <TableCell className="text-center">{views}</TableCell>
                                    <TableCell className="text-center">{clicks}</TableCell>
                                    <TableCell className="text-center">{navigations}</TableCell>
                                    <TableCell className="text-center">{conversionRate.toFixed(2)}%</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}