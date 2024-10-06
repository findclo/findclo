"use client"

import { privateBrandsApiWrapper } from "@/api-wrappers/brands"
import { publicProductsApiWrapper } from "@/api-wrappers/products"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { IBrand } from "@/lib/backend/models/interfaces/brand.interface"
import { IProduct } from "@/lib/backend/models/interfaces/product.interface"
import Cookies from "js-cookie"
import { Download, Edit, FileDown, Plus, Trash2, Upload } from "lucide-react"
import Image from 'next/image'
import { useCallback, useEffect, useState } from "react"

export default function ShopAdminProductsPage() {
  const [brand, setBrand] = useState<IBrand | null>(null);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [newProduct, setNewProduct] = useState<Partial<IProduct>>({ name: "", price: 0, images: [], description: "" });
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);

  const fetchBrandDetails = useCallback(async () => {
    const brandData = await privateBrandsApiWrapper.getMyBrand(Cookies.get('Authorization')!);
    setBrand(brandData);
    return brandData;
  }, []);

  const fetchProducts = useCallback(async (brandId: string) => {
    const productsData = await publicProductsApiWrapper.getProductsByBrandId(brandId);
    if (productsData) {
      setProducts(productsData.products);
    }
  }, []);

  useEffect(() => {
    async function loadData() {
      const brandData = await fetchBrandDetails();
      if (brandData) {
        await fetchProducts(brandData.id.toString());
      }
    }
    loadData();
  }, [fetchBrandDetails, fetchProducts]);

  if (!brand) {
    return <div>Cargando productos...</div>
  }

  const handleAddProduct = () => {
    setProducts([...products, { ...newProduct, id: products.length + 1 } as IProduct])
    setNewProduct({ name: "", price: 0, images: [], description: "" })
    setIsAddProductOpen(false)
  }

  const handleDeleteProduct = (id: number) => {
    setProducts(products.filter(product => product.id !== id))
  }

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "ID,Name,Price,Stock,Image,Description\n" +
      products.map(p => `${p.id},${p.name},${p.price},${p.images[0]},${p.description}`).join("\n")
    const encodedUri = encodeURI(csvContent)
    window.open(encodedUri)
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between mb-4">
        <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Añadir Producto</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Añadir Nuevo Producto</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Nombre</Label>
                <Input id="name" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right">Precio</Label>
                <Input id="price" type="number" value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: parseFloat(e.target.value)})} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="image" className="text-right">URL de Imagen</Label>
                <Input id="image" value={newProduct.images?.[0]} onChange={(e) => setNewProduct({...newProduct, images: [e.target.value]})} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">Descripción</Label>
                <Textarea id="description" value={newProduct.description} onChange={(e) => setNewProduct({...newProduct, description: e.target.value})} className="col-span-3" />
              </div>
            </div>
            <Button onClick={handleAddProduct}>Añadir Producto</Button>
          </DialogContent>
        </Dialog>
        <div className="space-x-2">
          <Button variant="outline"><Upload className="mr-2 h-4 w-4" /> Importar</Button>
          <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Descargar Plantilla</Button>
          <Button variant="outline" onClick={handleExport}><FileDown className="mr-2 h-4 w-4" /> Exportar</Button>
        </div>
      </div>
      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-bold">Productos</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky top-0 bg-background">Imagen</TableHead>
                  <TableHead className="sticky top-0 bg-background">Nombre</TableHead>
                  <TableHead className="sticky top-0 bg-background">Precio</TableHead>
                  <TableHead className="sticky top-0 bg-background">Stock</TableHead>
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
                          alt={product.name}
                          width={40}
                          height={40}
                          className="rounded"
                        />
                      </TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>${product.price.toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm"><Edit className="h-4 w-4" /></Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Detalles del Producto</DialogTitle>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label className="text-right">Nombre</Label>
                                  <div className="col-span-3">{product.name}</div>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label className="text-right">Precio</Label>
                                  <div className="col-span-3">${product.price.toFixed(2)}</div>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label className="text-right">Imagen</Label>
                                  <Image src={product.images[0]} alt={product.name} className="col-span-3 w-full h-40 object-cover" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label className="text-right">Descripción</Label>
                                  <div className="col-span-3">{product.description}</div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button variant="outline" size="sm" onClick={() => handleDeleteProduct(product.id)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
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