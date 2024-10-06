"use client"

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { IBrand } from "@/lib/backend/models/interfaces/brand.interface";
import { IProduct } from "@/lib/backend/models/interfaces/product.interface";
import { publicBrandsApiWrapper } from "@/api-wrappers/brands";
import { publicProductsApiWrapper } from "@/api-wrappers/products";

export default function BrandDetails({ params }: { params: { id: string } }) {
    const id = params.id;
    const router = useRouter();
    const [brand, setBrand] = useState<IBrand | null>(null);
    const [products, setProducts] = useState<IProduct[]>([]);

    useEffect(() => {
        async function fetchBrandDetails() {
            const brandData = await publicBrandsApiWrapper.getBrandById(id);
            setBrand(brandData);
        }

        async function fetchProducts() {
            const productsData = await publicProductsApiWrapper.getProductsByBrandId(id);
            if (productsData) {
                setProducts(productsData.products);
            }
        }

        fetchBrandDetails();
        fetchProducts();
    }, [id]);

    if (!brand) {
        return <div>Loading...</div>;
    }

    return (
        <div className="container mx-auto p-6">
            <div className="flex items-center justify-between mb-6">
                <Button
                    variant="ghost"
                    className="flex items-center"
                    onClick={() => router.push('/admin')}
                >
                    <ArrowLeft className="mr-2 h-4 w-4"/>
                    Volver
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-1">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-2xl font-bold">Detalles</CardTitle>
                    </CardHeader>
                    <CardContent
                        className="relative flex flex-col md:flex-row items-start"> {/* Cambiado para soporte de posicionamiento absoluto */}
                        <div
                            className="flex items-center space-x-4 mb-2 md:mb-0"> {/* Añadido margen inferior para dispositivos móviles */}
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
                            className="absolute right-4 top-2"
                        >
                            <Button>
                                <span className="hidden md:inline">Ir a la pagina del comercio</span>
                                <span className="md:hidden">🔗</span>
                            </Button>
                        </a>
                    </CardContent>
                </Card>
            </div>


            <Card className="mt-6">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xl font-bold">Productos</CardTitle>
                    <ShoppingBag className="h-4 w-4 text-muted-foreground"/>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[400px] overflow-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="sticky top-0 bg-background">Imagen</TableHead>
                                    <TableHead className="sticky top-0 bg-background">Nombre</TableHead>
                                    <TableHead className="sticky top-0 bg-background">Precio</TableHead>
                                    <TableHead className="sticky top-0 bg-background">Descripción</TableHead>
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
                                            <TableCell>{product.description}</TableCell>
                                            <TableCell>
                                                <a
                                                    href={product.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <Button>Ver en página del comercio</Button>
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
    );
}