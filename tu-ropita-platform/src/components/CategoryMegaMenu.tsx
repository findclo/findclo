'use client'

import { publicCategoriesApiWrapper } from "@/api-wrappers/categories";
import { ICategoryTree } from "@/lib/backend/models/interfaces/category.interface";
import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Grid3x3, Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

interface CategoryMegaMenuProps {
  activeCategoryId?: number | null;
  currentSearchQuery?: string;
}

export const CategoryMegaMenu = ({ activeCategoryId = null, currentSearchQuery = '' }: CategoryMegaMenuProps = {}) => {
  const [categories, setCategories] = useState<ICategoryTree[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const router = useRouter();

  const loadCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      const categoryTree = await publicCategoriesApiWrapper.getCategoryTree();
      setCategories(categoryTree.categories);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleCategoryClick = useCallback((categoryId: number) => {
    setIsSheetOpen(false);
    const params = new URLSearchParams();
    params.append('categoryId', categoryId.toString());
    if (currentSearchQuery?.trim()) {
      params.append('search', currentSearchQuery.trim());
    }
    router.push(`/search?${params.toString()}`);
  }, [router, currentSearchQuery]);

  // Helper function to find parent category ID
  const getParentCategoryId = useCallback((categoryId: number | null): number | null => {
    if (!categoryId) return null;

    for (const mainCat of categories) {
      if (mainCat.id === categoryId) return mainCat.id;

      for (const subCat of mainCat.children) {
        if (subCat.id === categoryId) return mainCat.id;

        for (const childCat of subCat.children) {
          if (childCat.id === categoryId) return mainCat.id;
        }
      }
    }
    return null;
  }, [categories]);

  const activeParentCategoryId = getParentCategoryId(activeCategoryId);

  if (isLoading) {
    return (
      <div className="sticky top-0 z-50 bg-white border-b border-black/5">
        <div className="container max-w-7xl mx-auto h-12 flex items-center justify-between">
          <div className="md:hidden">
            <div className="h-4 bg-neutral-200 rounded w-24 animate-pulse"></div>
          </div>
          <div className="hidden md:flex gap-8 animate-pulse">
            <div className="h-4 bg-neutral-200 rounded w-16"></div>
            <div className="h-4 bg-neutral-200 rounded w-16"></div>
            <div className="h-4 bg-neutral-200 rounded w-20"></div>
            <div className="h-4 bg-neutral-200 rounded w-16"></div>
          </div>
        </div>
      </div>
    );
  }

  // Filter top-level categories (parent_id is null or level 0)
  const mainCategories = categories.filter(cat => cat.parent_id === null);

  return (
    <div className="sticky top-0 z-50 bg-white border-b border-black/5">
      <div className="container max-w-7xl mx-auto h-12 flex items-center justify-between">
        {/* Mobile - Sheet with Categories */}
        <div className="md:hidden">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" className="gap-2 font-medium text-sm">
                <Grid3x3 className="h-4 w-4" />
                Categorías
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <SheetHeader>
                <SheetTitle>Categorías</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <Accordion type="single" collapsible className="w-full">
                  {mainCategories.map((mainCategory) => (
                    <AccordionItem key={mainCategory.id} value={`cat-${mainCategory.id}`}>
                      <AccordionTrigger className="text-sm font-medium">
                        {mainCategory.name}
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-1 pl-2">
                          {mainCategory.children.map((subCategory) => {
                            const isSubCategoryActive = activeCategoryId === subCategory.id;
                            return (
                              <div key={subCategory.id}>
                                <button
                                  onClick={() => handleCategoryClick(subCategory.id)}
                                  className={cn(
                                    "block w-full text-left py-2 px-3 rounded-md",
                                    "transition-colors duration-200",
                                    isSubCategoryActive
                                      ? "bg-black text-white font-medium text-sm"
                                      : "text-sm text-neutral-600 hover:text-black hover:bg-neutral-50"
                                  )}
                                >
                                  {subCategory.name}
                                </button>
                                {/* Third level categories */}
                                {subCategory.children.length > 0 && (
                                  <div className="ml-4 space-y-1 border-l border-neutral-200 pl-3 mt-1">
                                    {subCategory.children.map((childCategory) => {
                                      const isChildCategoryActive = activeCategoryId === childCategory.id;
                                      return (
                                        <button
                                          key={childCategory.id}
                                          onClick={() => handleCategoryClick(childCategory.id)}
                                          className={cn(
                                            "block w-full text-left py-1.5 px-2 rounded-md",
                                            "transition-colors duration-200",
                                            isChildCategoryActive
                                              ? "bg-black text-white font-medium text-xs"
                                              : "text-xs text-neutral-500 hover:text-black hover:bg-neutral-50"
                                          )}
                                        >
                                          {childCategory.name}
                                        </button>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop - Mega Menu */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList className="gap-8">
            {mainCategories.map((mainCategory) => {
              const isMainCategoryActive = activeParentCategoryId === mainCategory.id;
              return (
                <NavigationMenuItem key={mainCategory.id}>
                  <NavigationMenuTrigger
                    className={cn(
                      "bg-transparent hover:bg-transparent focus:bg-transparent",
                      "data-[state=open]:bg-transparent data-[active]:bg-transparent",
                      "text-sm transition-colors duration-200",
                      "h-auto px-0",
                      isMainCategoryActive
                        ? "text-black font-semibold border-b-2 border-black"
                        : "text-black font-medium hover:text-black/60"
                    )}
                  >
                    {mainCategory.name}
                  </NavigationMenuTrigger>
                <NavigationMenuContent
                  className={cn(
                    "bg-white border-t border-black/5 shadow-lg z-[100]",
                    "animate-in fade-in-0 slide-in-from-top-2 duration-200"
                  )}
                >
                  <div className="py-6 px-8 w-[600px]">
                    {mainCategory.children.length > 0 ? (
                      <div className="grid grid-cols-3 gap-6">
                        {mainCategory.children.map((subCategory) => {
                          const isSubCategoryActive = activeCategoryId === subCategory.id;
                          return (
                            <div key={subCategory.id}>
                              <NavigationMenuLink asChild>
                                <button
                                  onClick={() => handleCategoryClick(subCategory.id)}
                                  className={cn(
                                    "block w-full text-left",
                                    "transition-colors duration-200",
                                    "py-1.5 px-2 rounded-md",
                                    isSubCategoryActive
                                      ? "text-sm font-semibold text-black bg-neutral-100"
                                      : "text-sm text-neutral-600 hover:text-black hover:bg-neutral-50"
                                  )}
                                >
                                  {subCategory.name}
                                </button>
                              </NavigationMenuLink>

                              {/* Third level categories if they exist */}
                              {subCategory.children.length > 0 && (
                                <div className="mt-2 ml-2 space-y-1 border-l border-neutral-200 pl-3">
                                  {subCategory.children.map((childCategory) => {
                                    const isChildCategoryActive = activeCategoryId === childCategory.id;
                                    return (
                                      <NavigationMenuLink key={childCategory.id} asChild>
                                        <button
                                          onClick={() => handleCategoryClick(childCategory.id)}
                                          className={cn(
                                            "block w-full text-left",
                                            "transition-colors duration-200",
                                            "py-1",
                                            isChildCategoryActive
                                              ? "text-xs font-semibold text-black"
                                              : "text-xs text-neutral-500 hover:text-black"
                                          )}
                                        >
                                          {childCategory.name}
                                        </button>
                                      </NavigationMenuLink>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <NavigationMenuLink asChild>
                        <button
                          onClick={() => handleCategoryClick(mainCategory.id)}
                          className={cn(
                            "block w-full text-left",
                            "text-sm text-neutral-600 hover:text-black",
                            "transition-colors duration-200",
                            "py-1.5 px-2 rounded-md hover:bg-neutral-50"
                          )}
                        >
                          Ver todos en {mainCategory.name}
                        </button>
                      </NavigationMenuLink>
                    )}
                  </div>
                </NavigationMenuContent>
                </NavigationMenuItem>
              );
            })}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </div>
  );
};
