"use client"

import React, { useState, useEffect } from 'react';
import { addDays, format } from 'date-fns';
import { es } from 'date-fns/locale';
import {CalendarIcon, RefreshCw} from 'lucide-react';
import { DateRange } from 'react-day-picker';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
    ChartContainer,
} from '@/components/ui/chart';
import { AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, Area} from 'recharts';
import Cookies from "js-cookie";
import { privateBrandsApiWrapper } from "@/api-wrappers/brands";
import { IBrand } from "@/lib/backend/models/interfaces/brand.interface";
import { privateMetricsApiWrapper } from "@/api-wrappers/metrics";
import { IMetrics } from "@/lib/backend/models/interfaces/metrics/metric.interface";
import toast from "@/components/toast";
import {ProductInteractionEnum} from "@/lib/backend/models/interfaces/metrics/productInteraction.interface";
import {IProductMetric} from "@/lib/backend/models/interfaces/metrics/product.metric.interface";
import ProductsMetricsTable from "@/components/ProductsMetricsTable";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";


export default function MarketplaceDashboard() {
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: addDays(new Date(), -30),
        to: new Date(),
    });
    const [data, setData] = useState<IMetrics[]>([]);
    const [productsMetrics, setProductsMetrics] = useState<IProductMetric[]>([]);
    const [dailyData, setDailyData] = useState<Record<string, any>[]>([]);
    const [brands, setBrands] = useState<IBrand[]>([]);
    const token = Cookies.get("Authorization");
    const [selectedBrand, setSelectedBrand] = useState<string>();

    useEffect(() => {
        privateBrandsApiWrapper.listAllBrands(token!)
            .then(b => setBrands(b));
    }, [token]);

    useEffect(() => {
        if (dateRange?.from && dateRange?.to) {
            privateMetricsApiWrapper.getMetrics(token!, dateRange.from, dateRange.to,selectedBrand)
                .then(d => setData(d));

            privateMetricsApiWrapper.getMetricsAggDaily(token!, dateRange.from, dateRange.to,selectedBrand)
                .then(metrics => {
                    const transformedData = metrics.reduce((acc, metric) => {
                        const dateKey = format(metric.date || new Date(), 'yyyy-MM-dd');
                        if (!acc[dateKey]) {
                            acc[dateKey] = { name: dateKey };
                        }
                        acc[dateKey][metric.interaction] = metric.count;
                        return acc;
                    }, {} as Record<string, any>);
                    const sortedData = Object.values(transformedData).sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime());

                    setDailyData(Object.values(sortedData));
                });

            privateMetricsApiWrapper.getProductsMetrics(token!, dateRange.from, dateRange.to,selectedBrand)
                .then(metrics => setProductsMetrics(metrics));
        }
    }, [dateRange,selectedBrand]);

    const getMaxValue = () => {
        return Math.ceil(Math.max(...dailyData.flatMap(entry =>
            Object.entries(entry)
                .filter(([key]) => key !== 'name')
                .map(([_, value]) => Number(value))
        )) * 1.1);
    };

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
};

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">Dashboard de Métricas del Marketplace</h1>

            <div className="flex flex-wrap gap-4 mb-6">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full sm:w-[300px] justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4"/>
                            {dateRange?.from ? (
                                dateRange.to ? (
                                    <>
                                        {format(dateRange.from, "P", {locale: es})} -{" "}
                                        {format(dateRange.to, "P", {locale: es})}
                                    </>
                                ) : (
                                    format(dateRange.from, "P", {locale: es})
                                )
                            ) : (
                                <span>Seleccionar rango de fechas</span>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={dateRange?.from}
                            selected={dateRange}
                            onSelect={setDateRange}
                            numberOfMonths={2}
                        />
                    </PopoverContent>
                </Popover>
                <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                        <SelectValue placeholder="Seleccionar marca" />
                    </SelectTrigger>
                    <SelectContent>
                        {brands.map((brand) => (
                            <SelectItem key={brand.id} value={brand.id.toString()}>
                                {brand.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="flex flex-wrap gap-4 mb-6 w-full">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
                    {Object.entries(chartConfig).map(([metric, config]) => {
                        const metricData = data.find(d => d.interaction === metric);
                        return (
                            <Card key={metric} className="w-full">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">{config.label}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {metricData ? metricData.count.toLocaleString() : '0'}
                                    </div>
                                    <p className="text-xs text-muted-foreground">Total en el periodo</p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

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
                                onClick={async () => {
                                    try {
                                        await privateMetricsApiWrapper.syncMetricsAggDaily(token!);
                                        // Assuming you have a toast function available
                                        toast({type: 'success', message: "Metricas sincronizadas correctamente."});
                                        window.location.reload();
                                    } catch (error) {
                                        console.error("Error syncing metrics:", error);
                                        toast({
                                            type: 'error',
                                            message: "Ocurrio un error al sincronizar las metricas. Intentelo de nuevo "
                                        });
                                    }
                                }}
                                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                                title="Recargar página"
                            >
                                <RefreshCw className="w-4 h-4"/>
                            </button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig}>
                            <AreaChart data={dailyData} margin={{top: 10, right: 10, left: 10, bottom: 10}}>
                                <defs>
                                    {Object.entries(chartConfig).map(([key, config]) => (
                                        <linearGradient key={key} id={`color${key}`} x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={config.color} stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor={config.color} stopOpacity={0}/>
                                        </linearGradient>
                                    ))}
                                </defs>
                                <XAxis dataKey="name"/>
                                <YAxis
                                    domain={[0, getMaxValue()]}
                                    tickFormatter={(value) => value.toLocaleString()}
                                    width={60}
                                />
                                <CartesianGrid strokeDasharray="3 3"/>
                                <Tooltip/>
                                {Object.entries(chartConfig).map(([key, config]) => (
                                    <Area
                                        key={key}
                                        type="monotone"
                                        dataKey={key}
                                        stroke={config.color}
                                        fillOpacity={1}
                                        fill={`url(#color${key})`}
                                    />
                                ))}
                            </AreaChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                <ProductsMetricsTable metrics={productsMetrics}/>
            </div>
        </div>
    );
}
