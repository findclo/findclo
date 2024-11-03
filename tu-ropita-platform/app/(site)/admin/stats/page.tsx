"use client"

import React, { useState, useEffect } from 'react';
import { addDays, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { DateRange } from 'react-day-picker';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent
} from '@/components/ui/chart';
import { LineChart, Line } from 'recharts';
import Cookies from "js-cookie";
import { privateBrandsApiWrapper } from "@/api-wrappers/brands";
import { IBrand } from "@/lib/backend/models/interfaces/brand.interface";
import { privateMetricsApiWrapper } from "@/api-wrappers/metrics";
import { IMetrics } from "@/lib/backend/models/metric.interface";

enum ProductInteractionEnum {
    VIEW_IN_LISTING_RELATED = 'view_in_listing_related',
    VIEW_IN_LISTING_PROMOTED = 'view_in_listing_promoted',
    CLICK = 'click',
    NAVIGATE_TO_BRAND_SITE = 'navigate_to_brand_site'
}

export default function MarketplaceDashboard() {
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: addDays(new Date(), -30),
        to: new Date(),
    });
    const [data, setData] = useState<IMetrics[]>([]);
    const [brands, setBrands] = useState<IBrand[]>([]);
    const token = Cookies.get("Authorization");

    useEffect(() => {
        privateBrandsApiWrapper.listAllBrands(token!)
            .then(b => setBrands(b));
    }, [token]);

    useEffect(() => {
        if (dateRange?.from && dateRange?.to) {
            privateMetricsApiWrapper.getMetricsAggDaily(token!, dateRange.from, dateRange.to)
                .then(d => setData(d));
        }
    }, [dateRange]);

    const chartConfig = {
        [ProductInteractionEnum.VIEW_IN_LISTING_RELATED]: {
            label: 'Vistas en listado relacionado',
            color: 'hsl(var(--chart-1))'
        },
        [ProductInteractionEnum.VIEW_IN_LISTING_PROMOTED]: {
            label: 'Vistas en listado promocionado',
            color: 'hsl(var(--chart-2))'
        },
        [ProductInteractionEnum.CLICK]: {
            label: 'Clics',
            color: 'hsl(var(--chart-3))'
        },
        [ProductInteractionEnum.NAVIGATE_TO_BRAND_SITE]: {
            label: 'Navegaciones al sitio de la marca',
            color: 'hsl(var(--chart-4))'
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">Dashboard de Métricas del Marketplace</h1>

            <div className="flex flex-wrap gap-4 mb-6">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full sm:w-[300px] justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateRange?.from ? (
                                dateRange.to ? (
                                    <>
                                        {format(dateRange.from, "P", { locale: es })} -{" "}
                                        {format(dateRange.to, "P", { locale: es })}
                                    </>
                                ) : (
                                    format(dateRange.from, "P", { locale: es })
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                    <CardTitle>Evolución de Métricas para las marcas</CardTitle>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="min-h-[200px] max-h-[600px] h-full w-full">
                        <LineChart data={data}>
                            {Object.entries(chartConfig).map(([key, config]) => (
                                <Line key={key} type="monotone" dataKey={key} stroke={config.color} strokeWidth={2} />
                            ))}
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <ChartLegend content={<ChartLegendContent />} />
                        </LineChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
    );
}
