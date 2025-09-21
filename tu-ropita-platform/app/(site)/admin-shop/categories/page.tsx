"use client"

import { privateBrandsApiWrapper } from "@/api-wrappers/brands";
import { privateCategoriesApiWrapper, publicCategoriesApiWrapper } from "@/api-wrappers/categories";
import { privateProductsApiWrapper } from "@/api-wrappers/products";
import toast from "@/components/toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { IBrand } from "@/lib/backend/models/interfaces/brand.interface";
import { ICategoryTree } from "@/lib/backend/models/interfaces/category.interface";
import { IProduct } from "@/lib/backend/models/interfaces/product.interface";
import { cn } from "@/lib/utils";
import Cookies from "js-cookie";
import { ChevronDown, ChevronRight, Loader2, Package, Tags } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";

export default function CategoryAssignmentPage() {
  const [brand, setBrand] = useState<IBrand | null>(null);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [categories, setCategories] = useState<ICategoryTree[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Set<number>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState(false);
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [categorySearchQuery, setCategorySearchQuery] = useState("");
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

      // Fetch products and categories in parallel
      const [productsResponse, categoriesResponse] = await Promise.all([
        privateProductsApiWrapper.getProductsOfBrand(authToken, brandData.id.toString(), true),
        publicCategoriesApiWrapper.getCategoryTree()
      ]);

      if (productsResponse) {
        setProducts(productsResponse.products);
      }

      if (categoriesResponse) {
        setCategories(categoriesResponse.categories);
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

  const filterCategoriesByQuery = useCallback((categories: ICategoryTree[], query: string): ICategoryTree[] => {
    if (!query) return categories;

    return categories.filter(category => {
      const matches = category.name.toLowerCase().includes(query.toLowerCase()) ||
                     category.description?.toLowerCase().includes(query.toLowerCase());

      if (matches) return true;

      if (category.children.length > 0) {
        const matchingChildren = filterCategoriesByQuery(category.children, query);
        return matchingChildren.length > 0;
      }

      return false;
    }).map(category => ({
      ...category,
      children: category.children.length > 0
        ? filterCategoriesByQuery(category.children, query)
        : []
    }));
  }, []);

  const filteredCategories = useMemo(() => {
    return filterCategoriesByQuery(categories, categorySearchQuery);
  }, [categories, categorySearchQuery, filterCategoriesByQuery]);

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

  const toggleCategoryExpansion = useCallback((categoryId: number) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  }, []);

  const isLeafCategory = useCallback((category: ICategoryTree) => {
    return category.children.length === 0;
  }, []);

  const handleCategorySelect = useCallback((categoryId: number, category: ICategoryTree) => {
    if (!isLeafCategory(category)) {
      toast({ type: "error", message: "Solo puedes seleccionar categorías que no tengan subcategorías." });
      return;
    }
    setSelectedCategory(categoryId);
  }, [isLeafCategory]);

  const handleAssignCategory = useCallback(async () => {
    if (!brand || !selectedCategory || selectedProducts.size === 0) {
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

      const success = await privateCategoriesApiWrapper.assignCategoryToProducts(
        authToken,
        brand.id.toString(),
        productIds,
        selectedCategory
      );

      if (success) {
        toast({
          type: "success",
          message: `Categoría asignada exitosamente a ${productIds.length} producto(s).`
        });
        setSelectedProducts(new Set());
        setSelectedCategory(null);
      } else {
        toast({ type: "error", message: "Error al asignar la categoría." });
      }
    } catch (error) {
      console.error('Error assigning category:', error);
      toast({ type: "error", message: "Error al asignar la categoría." });
    } finally {
      setIsAssigning(false);
    }
  }, [brand, selectedCategory, selectedProducts, authToken]);

  const renderCategoryItem = useCallback((category: ICategoryTree, level: number = 0) => {
    const hasChildren = category.children.length > 0;
    const isExpanded = expandedCategories.has(category.id);
    const isSelected = selectedCategory === category.id;
    const isLeaf = isLeafCategory(category);

    return (
      <div key={category.id} className="category-item">
        <div
          className={cn(
            'flex items-center p-2 rounded-lg border transition-all duration-200',
            'hover:bg-gray-50 dark:hover:bg-gray-800',
            isSelected && 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
            !isLeaf && 'opacity-60'
          )}
          style={{ marginLeft: `${level * 20}px` }}
        >
          {/* Expand/Collapse Button */}
          {hasChildren && (
            <button
              onClick={() => toggleCategoryExpansion(category.id)}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded mr-2"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          )}

          {/* Radio button for leaf categories only */}
          <div className="flex items-center space-x-2 flex-1">
            <input
              type="radio"
              name="category"
              value={category.id}
              checked={isSelected}
              disabled={!isLeaf}
              onChange={() => handleCategorySelect(category.id, category)}
              className={cn(
                "w-4 h-4",
                !isLeaf && "cursor-not-allowed opacity-50"
              )}
            />
            <div className="flex-1 min-w-0">
              <h3 className={cn(
                'text-sm font-medium truncate',
                isLeaf ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
              )}>
                {category.name}
              </h3>
              {!isLeaf && (
                <p className="text-xs text-gray-400">
                  Contiene subcategorías
                </p>
              )}
              {category.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {category.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="mt-1">
            {category.children.map(child => renderCategoryItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  }, [expandedCategories, selectedCategory, isLeafCategory, toggleCategoryExpansion, handleCategorySelect]);

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

  const selectedCategoryName = selectedCategory
    ? categories.find(c => c.id === selectedCategory)?.name || 'Categoría seleccionada'
    : null;

  return (
    <div className="container mx-auto p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Asignar Categorías a Productos
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Selecciona productos y asígnalos a una categoría específica
        </p>
      </div>

      {/* Action Bar */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Package className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                {selectedProducts.size} producto(s) seleccionado(s)
              </span>
            </div>
            {selectedCategoryName && (
              <div className="flex items-center space-x-2">
                <Tags className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Categoría: {selectedCategoryName}
                </span>
              </div>
            )}
          </div>
          <Button
            onClick={handleAssignCategory}
            disabled={selectedProducts.size === 0 || !selectedCategory || isAssigning}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isAssigning ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Asignando...
              </>
            ) : (
              'Asignar Categoría'
            )}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Products Section */}
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
            <ScrollArea className="h-96">
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
                      <div className="relative w-12 h-12 rounded-md overflow-hidden">
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
                      {/* Current categories display */}
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

        {/* Categories Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Tags className="w-5 h-5" />
              <span>Categorías</span>
            </CardTitle>
            <Input
              placeholder="Buscar categorías..."
              value={categorySearchQuery}
              onChange={(e) => setCategorySearchQuery(e.target.value)}
            />
            <p className="text-sm text-gray-500">
              Solo puedes seleccionar categorías que no tengan subcategorías
            </p>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-1">
                {filteredCategories.map(category => renderCategoryItem(category))}
                {filteredCategories.length === 0 && (
                  <p className="text-center text-gray-500 py-8">
                    No se encontraron categorías.
                  </p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}