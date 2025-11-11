'use client'

import { publicCategoriesApiWrapper } from "@/api-wrappers/categories";
import { ICategoryTree } from "@/lib/backend/models/interfaces/category.interface";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, ChevronRight, ChevronDown, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";

export interface MenuItemType {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface CategoryMegaMenuProps {
  activeCategoryId?: number | null;
  inline?: boolean; // true when integrated in Header, false for standalone sticky behavior
  menuItems?: MenuItemType[]; // Additional menu items to show below categories (mobile only)
  footerContent?: React.ReactNode; // Custom footer content for mobile menu
  currentPath?: string; // Current pathname for highlighting active menu items
}

// Recursive component for category items with unlimited nesting
interface RecursiveCategoryItemProps {
  category: ICategoryTree;
  level: number;
  activeCategoryId: number | null;
  onNavigate: (categoryId: number) => void;
}

const RecursiveCategoryItem: React.FC<RecursiveCategoryItemProps> = ({
  category,
  level,
  activeCategoryId,
  onNavigate
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = category.children && category.children.length > 0;
  const isActive = activeCategoryId === category.id;

  return (
    <div className={cn("space-y-0.5", level > 0 && "ml-3")}>
      <div className="flex items-center gap-0.5 group">
        {hasChildren && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-0.5 hover:bg-gray-100 rounded transition-colors"
            aria-label={isExpanded ? "Colapsar" : "Expandir"}
          >
            {isExpanded ? (
              <ChevronDown className="h-3 w-3 text-gray-500" />
            ) : (
              <ChevronRight className="h-3 w-3 text-gray-500" />
            )}
          </button>
        )}
        {!hasChildren && <span className="w-3.5" />}

        <button
          onClick={() => onNavigate(category.id)}
          className={cn(
            "text-xs text-left transition-colors flex-1 py-0.5",
            isActive
              ? "text-blue-600 font-semibold"
              : "text-gray-700 hover:text-black hover:underline"
          )}
        >
          {category.name}
        </button>
      </div>

      {isExpanded && hasChildren && (
        <div className="space-y-0.5 mt-0.5">
          {category.children.map((child) => (
            <RecursiveCategoryItem
              key={child.id}
              category={child}
              level={level + 1}
              activeCategoryId={activeCategoryId}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const CategoryMegaMenu = ({
  activeCategoryId = null,
  inline = false,
  menuItems = [],
  footerContent = null,
  currentPath = ''
}: CategoryMegaMenuProps = {}) => {
  const [categories, setCategories] = useState<ICategoryTree[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
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
    setIsMegaMenuOpen(false);
    // Preserve all existing query params from current URL
    const currentParams = new URLSearchParams(window.location.search);
    // Update only the categoryId
    currentParams.set('categoryId', categoryId.toString());
    router.push(`/search?${currentParams.toString()}`);
  }, [router]);

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
      <div className={cn(
        inline ? "" : "sticky top-0 z-50 bg-white border-b border-black/5"
      )}>
        <div className={cn(
          inline ? "flex items-center" : "container max-w-7xl mx-auto h-12 flex items-center justify-between"
        )}>
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
    <div className={cn(
      inline ? "" : "sticky top-0 z-50 bg-white border-b border-black/5"
    )}>
      <div className={cn(
        inline ? "flex items-center" : "container max-w-7xl mx-auto h-12 flex items-center justify-between"
      )}>
        {/* Mobile - Sheet with Categories */}
        <div className="md:hidden">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" className="gap-2 font-medium text-sm">
                <Menu className="h-4 w-4" />
                Menú
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 flex flex-col">
              <SheetHeader>
                <SheetTitle>Menú</SheetTitle>
              </SheetHeader>

              {/* Contenedor principal dividido en parte scrollable y footer fijo */}
              <div className="flex flex-col flex-1 justify-between overflow-hidden">
                {/* Sección scrollable */}
                <div className="overflow-y-auto pr-2 mt-6">
                  <Accordion type="single" collapsible defaultValue="explorar" className="w-full">
                    <AccordionItem value="explorar" className="border-none">
                      <AccordionTrigger className="text-base font-semibold hover:no-underline">
                        Categorías
                      </AccordionTrigger>
                      <AccordionContent>
                        <Accordion type="multiple" className="w-full pl-2">
                          {mainCategories.map((mainCategory) => {
                            const isMainCategoryActive = activeCategoryId === mainCategory.id;
                            const hasChildren = mainCategory.children.length > 0;

                            return (
                              <AccordionItem key={mainCategory.id} value={`cat-${mainCategory.id}`} className="border-b">
                                <div className="flex items-center">
                                  {hasChildren ? (
                                    <AccordionTrigger className="flex-1 text-sm font-medium hover:no-underline py-3">
                                      <span
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleCategoryClick(mainCategory.id);
                                        }}
                                        className={cn(
                                          "hover:underline",
                                          isMainCategoryActive && "text-blue-600 font-semibold"
                                        )}
                                      >
                                        {mainCategory.name}
                                      </span>
                                    </AccordionTrigger>
                                  ) : (
                                    <button
                                      onClick={() => handleCategoryClick(mainCategory.id)}
                                      className={cn(
                                        "flex-1 text-left py-3 text-sm font-medium",
                                        isMainCategoryActive && "text-blue-600 font-semibold"
                                      )}
                                    >
                                      {mainCategory.name}
                                    </button>
                                  )}
                                </div>

                                {hasChildren && (
                                  <AccordionContent>
                                    <div className="space-y-2 pl-2">
                                      {mainCategory.children.map((subCategory) => (
                                        <RecursiveCategoryItem
                                          key={subCategory.id}
                                          category={subCategory}
                                          level={0}
                                          activeCategoryId={activeCategoryId}
                                          onNavigate={handleCategoryClick}
                                        />
                                      ))}
                                    </div>
                                  </AccordionContent>
                                )}
                              </AccordionItem>
                            );
                          })}
                        </Accordion>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>

                {/* Footer fijo al fondo */}
                <div className="border-t pt-4 pb-5 bg-white">
                  {footerContent && <div className="mb-4">{footerContent}</div>}

                  {menuItems.length > 0 && (
                    <nav className="flex flex-col gap-2">
                      {menuItems.map((item, index) => (
                        <Link
                          key={index}
                          href={item.href}
                          onClick={() => setIsSheetOpen(false)}
                          className={cn(
                            "flex items-center gap-3 py-2.5 px-3 rounded-lg transition-colors",
                            currentPath === item.href
                              ? "bg-blue-50 text-blue-600 font-semibold"
                              : "text-gray-700 hover:bg-gray-100"
                          )}
                        >
                          <item.icon className="h-5 w-5" />
                          <span className="text-sm">{item.label}</span>
                        </Link>
                      ))}
                    </nav>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop - Full-Width Mega Menu */}
        <div className="hidden md:flex relative">
          <Button
            variant="ghost"
            className="gap-2 font-medium text-sm"
            onClick={() => setIsMegaMenuOpen(!isMegaMenuOpen)}
          >
            <Menu className="h-4 w-4" />
            Menú
            <ChevronDown className={cn(
              "h-3 w-3 transition-transform duration-200",
              isMegaMenuOpen && "rotate-180"
            )} />
          </Button>

          {isMegaMenuOpen && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 bg-black/20 z-40"
                onClick={() => setIsMegaMenuOpen(false)}
                aria-label="Cerrar menú"
              />

              {/* Full-Width Mega Menu */}
              <div className="absolute top-full left-0 bg-white shadow-2xl z-50 animate-in fade-in-0 slide-in-from-top-2 duration-200 w-[700px]">
                <div className="py-4 px-6 max-h-96 overflow-y-auto">
                  {/* Header */}
                  <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-200">
                    <h2 className="text-lg font-bold text-gray-900 uppercase">
                      Menú de Categorías
                    </h2>
                    <button
                      onClick={() => setIsMegaMenuOpen(false)}
                      className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                      aria-label="Cerrar"
                    >
                      <X className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>

                  {/* Grid of Categories */}
                  <div className={cn(
                    "grid gap-6",
                    mainCategories.length === 2 && "grid-cols-2",
                    mainCategories.length === 3 && "grid-cols-3",
                    mainCategories.length >= 4 && "grid-cols-4"
                  )}>
                    {mainCategories.map((mainCategory) => (
                      <div key={mainCategory.id} className="space-y-2">
                        {/* Category Title - Clickeable */}
                        <button
                          onClick={() => handleCategoryClick(mainCategory.id)}
                          className="w-full text-left border-b border-gray-300 pb-1 hover:border-blue-400 transition-colors group"
                        >
                          <h3 className="text-sm font-bold uppercase text-gray-900 group-hover:text-blue-600 transition-colors">
                            {mainCategory.name}
                          </h3>
                        </button>

                        {/* Subcategories - Recursive */}
                        {mainCategory.children && mainCategory.children.length > 0 && (
                          <div className="space-y-1.5">
                            {mainCategory.children.map((subCategory) => (
                              <RecursiveCategoryItem
                                key={subCategory.id}
                                category={subCategory}
                                level={0}
                                activeCategoryId={activeCategoryId}
                                onNavigate={handleCategoryClick}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
