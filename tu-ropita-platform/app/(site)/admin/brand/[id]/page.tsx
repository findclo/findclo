'use client'

import { privateBrandsApiWrapper, publicBrandsApiWrapper } from "@/api-wrappers/brands"
import { privateMetricsApiWrapper } from "@/api-wrappers/metrics"
import { privateProductsApiWrapper } from "@/api-wrappers/products"
import MetricCardsGrid from "@/components/MetricCardsGrid"
import MetricsChart from "@/components/ProductsMetricChart"
import toast from "@/components/toast"
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { IBrand } from "@/lib/backend/models/interfaces/brand.interface"
import { IBrandCredits } from "@/lib/backend/models/interfaces/IBrandCredits"
import { IMetrics } from "@/lib/backend/models/interfaces/metrics/metric.interface"
import { IProductMetric } from "@/lib/backend/models/interfaces/metrics/product.metric.interface"
import { IProduct } from "@/lib/backend/models/interfaces/product.interface"
import { addDays, format } from 'date-fns'
import Cookies from "js-cookie"
import { ArrowLeft, ArrowUpDown, FileDown, Search } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

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
    const [brandCredits, setBrandCredits] = useState<IBrandCredits | null>(null);
    const token = Cookies.get('Authorization')!;
    const [metrics, setMetrics] = useState<IMetrics[]>([]);
    const [dailyData, setDailyData] = useState<Record<string, any>[]>([]);
    const [productsMetrics, setProductsMetrics] = useState<IProductMetric[]>([]);
    const [sortColumn, setSortColumn] = useState<string>('views');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [isAddCreditsOpen, setIsAddCreditsOpen] = useState(false)
    const [creditsToAdd, setCreditsToAdd] = useState<string>('')
    const [isRemoveCreditsOpen, setIsRemoveCreditsOpen] = useState(false)
    const [creditsToRemove, setCreditsToRemove] = useState<string>('')
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 50;

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

        async function fetchProducts(page: number = 1) {
            const productsData = await privateBrandsApiWrapper.getBrandProductsAsPrivilegedUser(
                token,
                id,
                false, // includeCategories
                false, // includeAttributes
                page,
                pageSize
            );
            if (productsData) {
                setProducts(productsData.products);
                setTotalPages(productsData.totalPages);
                setCurrentPage(productsData.pageNum);
            }
        }

        async function fetchCredits() {
            if (id) {
                const credits = await privateBrandsApiWrapper.getBrandCredits(
                    token,
                    id
                );
                if (credits) {
                    setBrandCredits(credits);
                }
            }
        };

        fetchCredits();
        fetchBrandDetails();
        fetchProducts();
    }, [id, token, pageSize]);

    useEffect(() => {
        async function fetchMetrics() {
            const fromDate = addDays(new Date(), -30);
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
        const filteredProducts = products.filter(product => 
            product.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        return [...filteredProducts].sort((a, b) => {
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
    }, [products, groupedMetrics, sortColumn, sortDirection, searchTerm]);

    const handleAddCredits = () => {
        setIsAddCreditsOpen(true)
    }

    const handleConfirmAddCredits = async (e: React.FormEvent) => {
        e.preventDefault()
        const credits = parseInt(creditsToAdd)
        if (isNaN(credits) || credits <= 0) {
            toast({
                type: 'error',
                message: 'Por favor ingrese un número válido de créditos'
            })
            return
        }

        if (!confirm(`¿Estás seguro de querer agregar ${credits} créditos a ${brand?.name}?`)) {
            return;
        }

        const result = await privateBrandsApiWrapper.addBrandCredits(token, id, credits)
        if (result) {
            setBrandCredits(result)
            toast({
                type: 'success',
                message: `Se agregaron ${credits} créditos exitosamente`
            })
            setCreditsToAdd('')
            setIsAddCreditsOpen(false)
        } else {
            toast({
                type: 'error',
                message: 'Error al agregar créditos'
            })
        }
    }

    const handleRemoveCredits = () => {
        setIsRemoveCreditsOpen(true)
    }

    const handleConfirmRemoveCredits = async (e: React.FormEvent) => {
        e.preventDefault()
        const credits = parseInt(creditsToRemove)
        if (isNaN(credits) || credits <= 0) {
            toast({
                type: 'error',
                message: 'Por favor ingrese un número válido de créditos'
            })
            return
        }

        if (!confirm(`¿Estás seguro de querer remover ${credits} créditos de ${brand?.name}?`)) {
            return;
        }

        const result = await privateBrandsApiWrapper.removeBrandCredits(token, id, credits)
        if (result) {
            setBrandCredits(result)
            toast({
                type: 'success',
                message: `Se removieron ${credits} créditos exitosamente`
            })
            setCreditsToRemove('')
            setIsRemoveCreditsOpen(false)
        } else {
            toast({
                type: 'error',
                message: 'Error al remover créditos'
            })
        }
    }

    if (!brand) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>
    }

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            // Refetch products with new page
            privateBrandsApiWrapper.getBrandProductsAsPrivilegedUser(
                token,
                id,
                false,
                false,
                page,
                pageSize
            ).then((productsData) => {
                if (productsData) {
                    setProducts(productsData.products);
                    setTotalPages(productsData.totalPages);
                    setCurrentPage(productsData.pageNum);
                }
            });
        }
    };

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
                <CardContent className="flex flex-col sm:flex-row items-start justify-between space-y-4 sm:space-y-0">
                    <div className="flex flex-col w-full">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex items-center space-x-4">
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
                            <div className="flex items-center gap-4 w-full sm:w-auto">
                                <div className="flex flex-col items-start sm:items-end">
                                    <span className="text-sm text-muted-foreground">Créditos disponibles</span>
                                    <span className="text-2xl font-bold">{ (brandCredits?.credits_available || 0) - (brandCredits?.credits_spent || 0) || 0}</span>
                                </div>
                                <Button variant="outline" onClick={handleAddCredits}>
                                    <span className="hidden sm:inline">Agregar créditos</span>
                                </Button>
                                <Button variant="outline" onClick={handleRemoveCredits} className="bg-red-50 hover:bg-red-100">
                                    <span className="hidden sm:inline">Remover créditos</span>
                                </Button>
                                <Dialog open={isAddCreditsOpen} onOpenChange={setIsAddCreditsOpen}>
                                    <DialogContent className="sm:max-w-[425px]">
                                        <DialogHeader>
                                            <DialogTitle>Agregar créditos</DialogTitle>
                                            <DialogDescription>
                                                Agregar créditos para {brand.name}
                                            </DialogDescription>
                                        </DialogHeader>
                                        <form onSubmit={handleConfirmAddCredits}>
                                            <div className="grid gap-4 py-4">
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <Label htmlFor="credits" className="text-right">
                                                        Créditos
                                                    </Label>
                                                    <Input
                                                        id="credits"
                                                        type="number"
                                                        className="col-span-3"
                                                        value={creditsToAdd}
                                                        onChange={(e) => setCreditsToAdd(e.target.value)}
                                                        min="1"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <Button type="button" variant="outline" onClick={() => setIsAddCreditsOpen(false)}>
                                                    Cancelar
                                                </Button>
                                                <Button type="submit">Agregar</Button>
                                            </DialogFooter>
                                        </form>
                                    </DialogContent>
                                </Dialog>
                                <Dialog open={isRemoveCreditsOpen} onOpenChange={setIsRemoveCreditsOpen}>
                                    <DialogContent className="sm:max-w-[425px]">
                                        <DialogHeader>
                                            <DialogTitle>Remover créditos</DialogTitle>
                                            <DialogDescription>
                                                Remover créditos de {brand.name}
                                            </DialogDescription>
                                        </DialogHeader>
                                        <form onSubmit={handleConfirmRemoveCredits}>
                                            <div className="grid gap-4 py-4">
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <Label htmlFor="credits-remove" className="text-right">
                                                        Créditos
                                                    </Label>
                                                    <Input
                                                        id="credits-remove"
                                                        type="number"
                                                        className="col-span-3"
                                                        value={creditsToRemove}
                                                        onChange={(e) => setCreditsToRemove(e.target.value)}
                                                        min="1"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <Button type="button" variant="outline" onClick={() => setIsRemoveCreditsOpen(false)}>
                                                    Cancelar
                                                </Button>
                                                <Button type="submit" variant="destructive">Remover</Button>
                                            </DialogFooter>
                                        </form>
                                    </DialogContent>
                                </Dialog>
                                <a
                                    href={brand.websiteUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Button>
                                        <span className="hidden sm:inline">Ir a la pagina del comercio</span>
                                        <span className="sm:hidden">🔗</span>
                                    </Button>
                                </a>
                            </div>
                        </div>
                    </div>
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
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <CardTitle className="text-xl font-bold">Productos</CardTitle>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                            <div className="relative flex-1 sm:w-64">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar por nombre..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-8 w-full"
                                />
                            </div>
                            <Button variant="outline" onClick={handleExport} className="w-full sm:w-auto whitespace-nowrap">
                                <FileDown className="mr-2 h-4 w-4" /> Exportar
                            </Button>
                        </div>
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
                                                <TableCell className="text-center">{Number(views).toLocaleString()}</TableCell>
                                                <TableCell className="text-center">{Number(clicks).toLocaleString()}</TableCell>
                                                <TableCell className="text-center">{Number(ctr)}%</TableCell>
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

            {totalPages > 1 && (
                <div className="flex justify-center mt-4">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (currentPage > 1) handlePageChange(currentPage - 1);
                                    }}
                                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                                />
                            </PaginationItem>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <PaginationItem key={page}>
                                    <PaginationLink
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handlePageChange(page);
                                        }}
                                        isActive={currentPage === page}
                                    >
                                        {page}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}
                            <PaginationItem>
                                <PaginationNext
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (currentPage < totalPages) handlePageChange(currentPage + 1);
                                    }}
                                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}

            {/* TODO: add payment history */}
        </div>
    )
}