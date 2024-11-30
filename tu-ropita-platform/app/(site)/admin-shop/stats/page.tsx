"use client"

import React, { useState, useEffect } from 'react';
import { addDays, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { DateRange } from 'react-day-picker';

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import Cookies from "js-cookie";
import { privateBrandsApiWrapper } from "@/api-wrappers/brands";
import { IBrand } from "@/lib/backend/models/interfaces/brand.interface";
import { privateMetricsApiWrapper } from "@/api-wrappers/metrics";
import { IMetrics } from "@/lib/backend/models/interfaces/metrics/metric.interface";
import toast from "@/components/toast";
import { IProductMetric } from "@/lib/backend/models/interfaces/metrics/product.metric.interface";
import ProductsMetricsTable from "@/components/ProductsMetricsTable";
import MetricsChart from "@/components/ProductsMetricChart";
import MetricCardsGrid from "@/components/MetricCardsGrid";

export default function AdminShopStats() {
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: addDays(new Date(), -30),
        to: new Date(),
    });
    const [data, setData] = useState<IMetrics[]>([]);
    const [productsMetrics, setProductsMetrics] = useState<IProductMetric[]>([]);
    const [dailyData, setDailyData] = useState<Record<string, any>[]>([]);
    const [brand, setBrand] = useState<IBrand | null>(null);
    const token = Cookies.get("Authorization");

    useEffect(() => {
        privateBrandsApiWrapper
            .getMyBrand(token!)
            .then(brandData => setBrand(brandData));
    }, [token]);

    useEffect(() => {
        if (dateRange?.from && dateRange?.to && brand) {
            privateMetricsApiWrapper.getBrandMetrics(token!, dateRange.from, dateRange.to, brand.id.toString())
                .then(d => setData(d));

            privateMetricsApiWrapper.getBrandMetricsAggDaily(token!, dateRange.from, dateRange.to, brand.id.toString())
                .then(metrics => {
                    const transformedData = metrics.reduce((acc, metric) => {
                        const dateKey = format(metric.date || new Date(), 'yyyy-MM-dd');
                        if (!acc[dateKey]) {
                            acc[dateKey] = { name: dateKey };
                        }
                        acc[dateKey][metric.interaction] = metric.count;
                        return acc;
                    }, {} as Record<string, any>);
                    const sortedData = Object
                        .values(transformedData)
                        .sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime());
                    setDailyData(Object.values(sortedData));
                });

            privateMetricsApiWrapper.getBrandsProductsMetrics(token!, dateRange.from, dateRange.to, brand.id.toString())
                .then(metrics => setProductsMetrics(metrics));
        }
    }, [dateRange, brand, token]);

    const handleRefresh = async () => {
        try {
            await privateMetricsApiWrapper.syncMetricsAggDaily(token!);
            toast({ type: 'success', message: "Metricas sincronizadas correctamente." });
            window.location.reload();
        } catch (error) {
            console.error("Error syncing metrics:", error);
            toast({
                type: 'error',
                message: "Ocurrio un error al sincronizar las metricas. Intentelo de nuevo "
            });
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
            </div>
            <div className="flex flex-wrap gap-4 mb-6 w-full">

                <MetricCardsGrid data={data}/>
                <MetricsChart dailyData={dailyData} onRefresh={handleRefresh} />

                <ProductsMetricsTable metrics={productsMetrics}/>
            </div>
        </div>
    );
}