'use client'

import { privateBrandsApiWrapper, publicBrandsApiWrapper } from "@/api-wrappers/brands"
import { privateMetricsApiWrapper } from "@/api-wrappers/metrics"
import { privateProductsApiWrapper } from "@/api-wrappers/products"
import MetricCardsGrid from "@/components/MetricCardsGrid"
import MetricsChart from "@/components/ProductsMetricChart"
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { IBrand } from "@/lib/backend/models/interfaces/brand.interface"
import { IMetrics } from "@/lib/backend/models/interfaces/metrics/metric.interface"
import { IProductMetric } from "@/lib/backend/models/interfaces/metrics/product.metric.interface"
import { IProduct } from "@/lib/backend/models/interfaces/product.interface"
import { addDays, format } from 'date-fns'
import Cookies from "js-cookie"
import { ArrowLeft, ArrowUpDown, FileDown } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

interface GroupedMetrics {
    [key: string]: {
        product: IProduct;
        views: number;
        clicks: number;
        navigations: number;
    }
}

export default function BrandDetails({ params }: { params: { id: string } }) {
    const id = params.id;
    const router = useRouter();
    const [brand, setBrand] = useState<IBrand | null>(null);
    const [products, setProducts] = useState<IProduct[]>([]);
    const token = Cookies.get('Authorization')!;
    const [metrics, setMetrics] = useState<IMetrics[]>([]);
    const [dailyData, setDailyData] = useState<Record<string, any>[]>([]);
    const [productsMetrics, setProductsMetrics] = useState<IProductMetric[]>([]);
    const [sortColumn, setSortColumn] = useState<string>('views');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    const groupedMetrics: GroupedMetrics = useMemo(() => {
        return productsMetrics.reduce((acc, metric) => {
            const productId = metric.product.id.toString();
            if (!acc[productId]) {
                acc[productId] = {
                    product: metric.product,
                    views: 0,
                    clicks: 0,
                    navigations: 0
                }
            }

            switch (metric.interaction) {
                case 'view_in_listing_related':
                    acc[productId].views += metric.count;
                    break;
                case 'click':
                    acc[productId].clicks += metric.count;
                    break;
                case 'navigate_to_brand_site':
                    acc[productId].navigations += metric.count;
                    break;
            }

            return acc;
        }, {} as GroupedMetrics);
    }, [productsMetrics]);

    useEffect(() => {
        async function fetchBrandDetails() {
            const brandData = await publicBrandsApiWrapper.getBrandById(id);
            setBrand(brandData);
        }

        async function fetchProducts() {
            const productsData = await privateBrandsApiWrapper.getBrandProductsAsPrivilegedUser(token,id);
            if (productsData) {
                setProducts(productsData.products);
            }
        }

        fetchBrandDetails();
        fetchProducts();
    }, [id]);

    useEffect(() => {
        async function fetchMetrics() {
            const fromDate = addDays(new Date(), -30); // Last 30 days
            const toDate = new Date();
            
            const metricsData = await privateMetricsApiWrapper.getMetrics(
                token,
                fromDate,
                toDate,
                id
            );
            setMetrics(metricsData);

            const dailyMetrics = await privateMetricsApiWrapper.getMetricsAggDaily(
                token,
                fromDate,
                toDate,
                id
            );
            
            const transformedData = dailyMetrics.reduce((acc, metric) => {
                const dateKey = format(metric.date || new Date(), 'yyyy-MM-dd');
                if (!acc[dateKey]) {
                    acc[dateKey] = { name: dateKey };
                }
                acc[dateKey][metric.interaction] = metric.count;
                return acc;
            }, {} as Record<string, any>);
            
            const sortedData = Object.values(transformedData)
                .sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime());
            
            setDailyData(sortedData);

            const productMetricsData = await privateMetricsApiWrapper.getProductsMetrics(
                token,
                fromDate,
                toDate,
                id
            );
            setProductsMetrics(productMetricsData);
            console.log(productMetricsData);
        }

        fetchMetrics();
    }, [id, token]);

    const handleStatusChange = async (productId: string, currentStatus: boolean) => {
        const newStatus = !currentStatus? 'PAUSED_BY_ADMIN' : 'ACTIVE';
        if(!confirm(`¿Estás seguro de querer cambiar el estado del producto?`)){
            return;
        }
        const updatedProduct = await privateProductsApiWrapper.changeProductStatus(token, productId, newStatus);
        if (updatedProduct) {
            setProducts(products.map(product => 
                product.id.toString() === productId ? updatedProduct : product
            ));
        }
    };

    const handleSort = (column: string) => {
        if (column === sortColumn) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('desc');
        }
    };

    const sortedProducts = useMemo(() => {
        return [...products].sort((a, b) => {
            const aMetrics = groupedMetrics[a.id.toString()];
            const bMetrics = groupedMetrics[b.id.toString()];
            
            let aValue = 0;
            let bValue = 0;

            switch(sortColumn) {
                case 'views':
                    aValue = aMetrics?.views || 0;
                    bValue = bMetrics?.views || 0;
                    break;
                case 'clicks':
                    aValue = aMetrics?.clicks || 0;
                    bValue = bMetrics?.clicks || 0;
                    break;
                case 'ctr':
                    const aCtr = aMetrics?.views ? (aMetrics.clicks / aMetrics.views) * 100 : 0;
                    const bCtr = bMetrics?.views ? (bMetrics.clicks / bMetrics.views) * 100 : 0;
                    aValue = aCtr;
                    bValue = bCtr;
                    break;
            }

            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }, [products, groupedMetrics, sortColumn, sortDirection]);

    if (!brand) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>
    }

    const handleExport = () => {
        const csvHeader = "name,price,description,images,url\n"
        const csvRows = products.map(product =>
            `"${product.name}",${product.price},"${product.description}","${product.images.join(';')}","${product.url || ''}"`
        ).join("\n")

        const csvContent = csvHeader + csvRows
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)

        const link = document.createElement('a')
        link.setAttribute('href', url)
        link.setAttribute('download', `FINDCLO_${brand.name}_productos_exportados.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <div className="container mx-auto p-4 sm:p-6">
            <div className="flex items-center justify-between mb-6">
                <Button
                    variant="ghost"
                    className="flex items-center"
                    onClick={() => router.push('/admin')}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver
                </Button>
            </div>

            <Card className="mb-6">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-2xl font-bold">Detalles</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row items-start justify-between">
                    <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                        <Image
                            src={brand.image || '/placeholder.svg'}
                            alt="Brand Logo"
                            width={64}
                            height={64}
                            className="rounded-full"
                        />
                        <div>
                            <h2 className="text-2xl font-bold">{brand.name}</h2>
                            <p className="text-sm text-muted-foreground">{brand.websiteUrl}</p>
                        </div>
                    </div>
                    <a
                        href={brand.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full sm:w-auto"
                    >
                        <Button className="w-full sm:w-auto">
                            <span className="hidden sm:inline">Ir a la pagina del comercio</span>
                            <span className="sm:hidden">🔗</span>
                        </Button>
                    </a>
                </CardContent>
            </Card>

            <div className="grid gap-6 mb-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Métricas de la Marca</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <MetricCardsGrid data={metrics} />
                    </CardContent>
                </Card>

                    <MetricsChart 
                        dailyData={dailyData} 
                        onRefresh={async () => {
                            await privateMetricsApiWrapper.syncMetricsAggDaily(token);
                            window.location.reload();
                        }} 
                    />
            </div>

            <Card>
                <CardHeader className="flex flex-col pb-2 space-y-0">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                        <CardTitle className="text-xl font-bold mb-2 sm:mb-0">Productos</CardTitle>
                        <Button variant="outline" onClick={handleExport} className="w-full sm:w-auto">
                            <FileDown className="mr-2 h-4 w-4" /> Exportar
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[400px] w-full overflow-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="sticky top-0 bg-background">Imagen</TableHead>
                                    <TableHead className="sticky top-0 bg-background">Nombre</TableHead>
                                    <TableHead className="sticky top-0 bg-background">Precio</TableHead>
                                    <TableHead className="sticky top-0 bg-background hidden md:table-cell">Descripción</TableHead>
                                    <TableHead className="sticky top-0 bg-background">Estado</TableHead>
                                    <TableHead className="sticky top-0 bg-background">
                                        <Button variant="ghost" onClick={() => handleSort('views')} className="w-full justify-center">
                                            Vistas
                                            <ArrowUpDown className="ml-2 h-4 w-4" />
                                        </Button>
                                    </TableHead>
                                    <TableHead className="sticky top-0 bg-background">
                                        <Button variant="ghost" onClick={() => handleSort('clicks')} className="w-full justify-center">
                                            Clicks
                                            <ArrowUpDown className="ml-2 h-4 w-4" />
                                        </Button>
                                    </TableHead>
                                    <TableHead className="sticky top-0 bg-background">
                                        <Button variant="ghost" onClick={() => handleSort('ctr')} className="w-full justify-center">
                                            CTR
                                            <ArrowUpDown className="ml-2 h-4 w-4" />
                                        </Button>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sortedProducts.length > 0 ? (
                                    sortedProducts.map((product) => {
                                        const productMetrics = groupedMetrics[product.id.toString()];
                                        const views = productMetrics?.views || 0;
                                        const clicks = productMetrics?.clicks || 0;
                                        const ctr = views > 0 ? ((clicks / views) * 100).toFixed(1) : "0";

                                        return (
                                            <TableRow key={product.id}>
                                                <TableCell>
                                                    <Image
                                                        src={product.images[0] || '/placeholder.svg'}
                                                        alt="Product Image"
                                                        width={40}
                                                        height={40}
                                                        className="rounded"
                                                    />
                                                </TableCell>
                                                <TableCell className="font-medium">{product.name}</TableCell>
                                                <TableCell>${product.price.toFixed(2)}</TableCell>
                                                <TableCell className="hidden md:table-cell">{product.description}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center space-x-2">
                                                        {product.status !== 'DELETED' ? (
                                                            <Switch
                                                                checked={product.status === 'ACTIVE'}
                                                                onCheckedChange={(checked) => handleStatusChange(product.id.toString(), checked)}
                                                                disabled={product.status === 'PAUSED'}
                                                            />
                                                        ) : null}
                                                        <span className={product.status === 'DELETED' ? 'text-red-500' : ''}>
                                                            {product.status === 'ACTIVE' 
                                                                ? 'Activo' 
                                                                : product.status === 'PAUSED_BY_ADMIN'
                                                                ? 'Pausado'
                                                                : product.status === 'DELETED'
                                                                ? 'Eliminado'
                                                                : 'Pausado por el comercio'
                                                            }
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">{views.toLocaleString()}</TableCell>
                                                <TableCell className="text-right">{clicks.toLocaleString()}</TableCell>
                                                <TableCell className="text-right">{ctr}%</TableCell>
                                            </TableRow>
                                        );
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={8}>No hay productos disponibles</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </CardContent>
            </Card>

            {/* TODO: add payment history */}
        </div>
    )
}