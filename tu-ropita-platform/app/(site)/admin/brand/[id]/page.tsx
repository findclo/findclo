'use client'

import { privateBrandsApiWrapper, publicBrandsApiWrapper } from "@/api-wrappers/brands"
import { privateProductsApiWrapper } from "@/api-wrappers/products"
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { IBrand } from "@/lib/backend/models/interfaces/brand.interface"
import { IProduct } from "@/lib/backend/models/interfaces/product.interface"
import Cookies from "js-cookie"
import { ArrowLeft, FileDown } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function BrandDetails({ params }: { params: { id: string } }) {
    const id = params.id;
    const router = useRouter();
    const [brand, setBrand] = useState<IBrand | null>(null);
    const [products, setProducts] = useState<IProduct[]>([]);
    const token = Cookies.get('Authorization')!;
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
                                    <TableHead className="sticky top-0 bg-background">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {products.length > 0 ? (
                                    products.map((product) => (
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
                                                    <Switch
                                                        checked={product.status === 'ACTIVE'}
                                                        onCheckedChange={(checked) => handleStatusChange(product.id.toString(), checked)}
                                                        disabled={product.status === 'PAUSED'}
                                                    />
                                                    <span>{product.status === 'ACTIVE' ? 'Activo' : (product.status === 'PAUSED_BY_ADMIN' ? 'Pausado' : 'Pausado por el comercio')}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <a
                                                    href={product.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-full sm:w-auto"
                                                >
                                                    <Button className="w-full sm:w-auto">
                                                        <span className="hidden sm:inline">Ver en página del comercio</span>
                                                        <span className="sm:hidden">Ver</span>
                                                    </Button>
                                                </a>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5}>No hay productos disponibles</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    )
}