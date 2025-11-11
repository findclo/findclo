"use client"

import { privateBrandsApiWrapper } from "@/api-wrappers/brands";
import { privateCategoriesApiWrapper } from "@/api-wrappers/categories";
import { privateProductsApiWrapper } from "@/api-wrappers/products";
import { privateAttributesApiWrapper } from "@/api-wrappers/attributes";
import toast from "@/components/toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { IBrand } from "@/lib/backend/models/interfaces/brand.interface";
import { IProduct } from "@/lib/backend/models/interfaces/product.interface";
import { cn } from "@/lib/utils";
import Cookies from "js-cookie";
import { Loader2, Package, Tags, Palette } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CategorySelector } from "../products/CategorySelector";
import { AttributeSelector } from "../products/AttributeSelector";
import { Separator } from "@/components/ui/separator";

export default function CategoryAssignmentPage() {
  const [brand, setBrand] = useState<IBrand | null>(null);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Set<number>>(new Set());
  const [selectedCategories, setSelectedCategories] = useState<Set<number>>(new Set());
  const [selectedAttributes, setSelectedAttributes] = useState<Map<number, Set<number>>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isAssigningAttributes, setIsAssigningAttributes] = useState(false);
  const [isRemovingAttributes, setIsRemovingAttributes] = useState(false);
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [showOnlyUnassigned, setShowOnlyUnassigned] = useState(false);

  const authToken = useMemo(() => Cookies.get("Authorization"), []);

  const fetchData = useCallback(async () => {
    if (!authToken) return;

    try {
      setIsLoading(true);

      // Fetch brand details
      const brandData = await privateBrandsApiWrapper.getMyBrand(authToken);
      if (!brandData) {
        toast({ type: "error", message: "No se pudo cargar la información de la marca." });
        return;
      }
      setBrand(brandData);

      // Fetch products
      const productsResponse = await privateProductsApiWrapper.getProductsOfBrand(authToken, brandData.id.toString(), true);

      if (productsResponse) {
        setProducts(productsResponse.products);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({ type: "error", message: "Error al cargar los datos." });
    } finally {
      setIsLoading(false);
    }
  }, [authToken]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Filter by search query
    if (productSearchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(productSearchQuery.toLowerCase())
      );
    }

    // Filter by unassigned categories
    if (showOnlyUnassigned) {
      filtered = filtered.filter(product =>
        !product.categories || product.categories.length === 0
      );
    }

    return filtered;
  }, [products, productSearchQuery, showOnlyUnassigned]);

  const toggleProductSelection = useCallback((productId: number) => {
    setSelectedProducts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  }, []);

  const toggleSelectAllProducts = useCallback(() => {
    if (selectedProducts.size === filteredProducts.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(filteredProducts.map(p => p.id)));
    }
  }, [selectedProducts.size, filteredProducts]);

  const handleAssignCategories = useCallback(async () => {
    if (!brand || selectedCategories.size === 0 || selectedProducts.size === 0) {
      toast({ type: "error", message: "Selecciona al menos un producto y una categoría." });
      return;
    }

    if (!authToken) {
      toast({ type: "error", message: "No se encontró token de autenticación." });
      return;
    }

    try {
      setIsAssigning(true);
      const productIds = Array.from(selectedProducts);
      const categoryIds = Array.from(selectedCategories);

      const success = await privateCategoriesApiWrapper.assignCategoriesToProducts(
        authToken,
        brand.id.toString(),
        productIds,
        categoryIds
      );

      if (success) {
        toast({
          type: "success",
          message: `${categoryIds.length} categoría(s) asignada(s) exitosamente a ${productIds.length} producto(s).`
        });
        // Refresh products to show updated categories
        await fetchData();
      } else {
        toast({ type: "error", message: "Error al asignar las categorías." });
      }
    } catch (error) {
      console.error('Error assigning categories:', error);
      toast({ type: "error", message: "Error al asignar las categorías." });
    } finally {
      setIsAssigning(false);
    }
  }, [brand, selectedCategories, selectedProducts, authToken, fetchData]);

  const handleRemoveCategories = useCallback(async () => {
    if (!brand || selectedCategories.size === 0 || selectedProducts.size === 0) {
      toast({ type: "error", message: "Selecciona al menos un producto y una categoría." });
      return;
    }

    if (!authToken) {
      toast({ type: "error", message: "No se encontró token de autenticación." });
      return;
    }

    try {
      setIsRemoving(true);
      const productIds = Array.from(selectedProducts);
      const categoryIds = Array.from(selectedCategories);

      const success = await privateCategoriesApiWrapper.removeCategoriesFromProducts(
        authToken,
        brand.id.toString(),
        productIds,
        categoryIds
      );

      if (success) {
        toast({
          type: "success",
          message: `${categoryIds.length} categoría(s) removida(s) exitosamente de ${productIds.length} producto(s).`
        });
        // Refresh products to show updated categories
        await fetchData();
      } else {
        toast({ type: "error", message: "Error al remover las categorías." });
      }
    } catch (error) {
      console.error('Error removing categories:', error);
      toast({ type: "error", message: "Error al remover las categorías." });
    } finally {
      setIsRemoving(false);
    }
  }, [brand, selectedCategories, selectedProducts, authToken, fetchData]);

  const handleAssignAttributes = useCallback(async () => {
    if (!brand || selectedAttributes.size === 0 || selectedProducts.size === 0) {
      toast({ type: "error", message: "Selecciona al menos un producto y un atributo." });
      return;
    }

    if (!authToken) {
      toast({ type: "error", message: "No se encontró token de autenticación." });
      return;
    }

    try {
      setIsAssigningAttributes(true);
      const productIds = Array.from(selectedProducts);

      // Convert Map<number, Set<number>> to the DTO format
      const attributes = Array.from(selectedAttributes.entries()).map(([attribute_id, value_ids]) => ({
        attribute_id,
        value_ids: Array.from(value_ids)
      }));

      await privateAttributesApiWrapper.assignAttributesToMultipleProducts(
        authToken,
        brand.id.toString(),
        productIds,
        { attributes }
      );

      toast({
        type: "success",
        message: `Atributos asignados exitosamente a ${productIds.length} producto(s).`
      });
      // Refresh products to show updated attributes
      await fetchData();
    } catch (error) {
      console.error('Error assigning attributes:', error);
      toast({ type: "error", message: "Error al asignar los atributos." });
    } finally {
      setIsAssigningAttributes(false);
    }
  }, [brand, selectedAttributes, selectedProducts, authToken, fetchData]);

  const handleRemoveAttributes = useCallback(async () => {
    if (!brand || selectedAttributes.size === 0 || selectedProducts.size === 0) {
      toast({ type: "error", message: "Selecciona al menos un producto y un atributo." });
      return;
    }

    if (!authToken) {
      toast({ type: "error", message: "No se encontró token de autenticación." });
      return;
    }

    try {
      setIsRemovingAttributes(true);
      const productIds = Array.from(selectedProducts);
      const attributeIds = Array.from(selectedAttributes.keys());

      await privateAttributesApiWrapper.removeAttributesFromMultipleProducts(
        authToken,
        brand.id.toString(),
        productIds,
        attributeIds
      );

      toast({
        type: "success",
        message: `Atributos removidos exitosamente de ${productIds.length} producto(s).`
      });
      // Refresh products to show updated attributes
      await fetchData();
    } catch (error) {
      console.error('Error removing attributes:', error);
      toast({ type: "error", message: "Error al remover los atributos." });
    } finally {
      setIsRemovingAttributes(false);
    }
  }, [brand, selectedAttributes, selectedProducts, authToken, fetchData]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-600">No se pudo cargar la información de la marca.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Gestión de Categorías y Atributos
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Asigna o remueve categorías y atributos de múltiples productos a la vez
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Products */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="w-5 h-5" />
                <span>Productos ({filteredProducts.length})</span>
              </CardTitle>
              <div className="space-y-2">
                <Input
                  placeholder="Buscar productos..."
                  value={productSearchQuery}
                  onChange={(e) => setProductSearchQuery(e.target.value)}
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="select-all"
                      checked={selectedProducts.size === filteredProducts.length && filteredProducts.length > 0}
                      onCheckedChange={toggleSelectAllProducts}
                    />
                    <Label htmlFor="select-all" className="text-sm">
                      Seleccionar todos
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="show-unassigned"
                      checked={showOnlyUnassigned}
                      onCheckedChange={(checked) => setShowOnlyUnassigned(checked === true)}
                    />
                    <Label htmlFor="show-unassigned" className="text-sm">
                      Solo sin categoría
                    </Label>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-2">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className={cn(
                        "flex items-center space-x-3 p-3 rounded-lg border transition-all",
                        "hover:bg-gray-50 dark:hover:bg-gray-800",
                        selectedProducts.has(product.id) && "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                      )}
                    >
                      <Checkbox
                        checked={selectedProducts.has(product.id)}
                        onCheckedChange={() => toggleProductSelection(product.id)}
                      />
                      {product.images && product.images.length > 0 && (
                        <div className="relative w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          ${product.price}
                        </p>
                        {/* Current categories and attributes display */}
                        <div className="mt-1 flex flex-wrap gap-1">
                          {product.categories && product.categories.length > 0 ? (
                            product.categories.map((category) => (
                              <Badge
                                key={category.id}
                                variant="secondary"
                                className="text-xs"
                              >
                                {category.name}
                              </Badge>
                            ))
                          ) : (
                            <Badge variant="outline" className="text-xs text-gray-400">
                              Sin categoría
                            </Badge>
                          )}
                          {product.attributes && product.attributes.length > 0 && (
                            <Badge variant="outline" className="text-xs bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
                              {product.attributes.length} atributo(s)
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {filteredProducts.length === 0 && (
                    <p className="text-center text-gray-500 py-8">
                      No se encontraron productos.
                    </p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Categories and Attributes */}
        <div className="space-y-6">
          {/* Categories Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Tags className="w-5 h-5" />
                <span>Categorías</span>
              </CardTitle>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Package className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      {selectedProducts.size} producto(s) • {selectedCategories.size} categoría(s)
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleAssignCategories}
                    disabled={selectedProducts.size === 0 || selectedCategories.size === 0 || isAssigning}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    size="sm"
                  >
                    {isAssigning ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Asignando...
                      </>
                    ) : (
                      'Asignar Categorías'
                    )}
                  </Button>
                  <Button
                    onClick={handleRemoveCategories}
                    disabled={selectedProducts.size === 0 || selectedCategories.size === 0 || isRemoving}
                    variant="destructive"
                    className="flex-1"
                    size="sm"
                  >
                    {isRemoving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Removiendo...
                      </>
                    ) : (
                      'Remover Categorías'
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CategorySelector
                selectedCategories={selectedCategories}
                onCategoriesChange={setSelectedCategories}
              />
            </CardContent>
          </Card>

          {/* Attributes Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Palette className="w-5 h-5" />
                <span>Atributos</span>
              </CardTitle>
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 border border-purple-200 dark:border-purple-800">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Package className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
                      {selectedProducts.size} producto(s) • {selectedAttributes.size} atributo(s)
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleAssignAttributes}
                    disabled={selectedProducts.size === 0 || selectedAttributes.size === 0 || isAssigningAttributes}
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                    size="sm"
                  >
                    {isAssigningAttributes ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Asignando...
                      </>
                    ) : (
                      'Asignar Atributos'
                    )}
                  </Button>
                  <Button
                    onClick={handleRemoveAttributes}
                    disabled={selectedProducts.size === 0 || selectedAttributes.size === 0 || isRemovingAttributes}
                    variant="destructive"
                    className="flex-1"
                    size="sm"
                  >
                    {isRemovingAttributes ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Removiendo...
                      </>
                    ) : (
                      'Remover Atributos'
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <AttributeSelector
                selectedAttributes={selectedAttributes}
                onAttributesChange={setSelectedAttributes}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
