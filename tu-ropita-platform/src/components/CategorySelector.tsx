'use client'

import { publicCategoriesApiWrapper } from "@/api-wrappers/categories";
import { ICategoryTree } from "@/lib/backend/models/interfaces/category.interface";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ChevronDown, 
  X, 
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export interface CategorySelectorProps {
  selectedCategoryId: number | null;
  onCategoryChange: (categoryId: number | null) => void;
  className?: string;
}

const getCategoryColor = (isSelected: boolean) => {
  
  if (isSelected) {
    return "bg-primary text-primary-foreground hover:bg-primary/90";
  }
  
  return "bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-200";
};

export function CategorySelector({ 
  selectedCategoryId, 
  onCategoryChange, 
  className 
}: CategorySelectorProps) {
  const [categories, setCategories] = useState<ICategoryTree[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

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

  const handleCategorySelect = useCallback((categoryId: number | null) => {
    onCategoryChange(categoryId);
    setIsOpen(false);
  }, [onCategoryChange]);

  const getSelectedCategoryPath = useCallback(() => {
    if (!selectedCategoryId) return null;

    const findCategoryPath = (cats: ICategoryTree[], path: ICategoryTree[] = []): ICategoryTree[] | null => {
      for (const cat of cats) {
        const currentPath = [...path, cat];
        if (cat.id === selectedCategoryId) return currentPath;

        if (cat.children.length > 0) {
          const found = findCategoryPath(cat.children, currentPath);
          if (found) return found;
        }
      }
      return null;
    };

    return findCategoryPath(categories);
  }, [selectedCategoryId, categories]);

  const selectedCategoryPath = getSelectedCategoryPath();
  const selectedCategory = selectedCategoryPath ? selectedCategoryPath[selectedCategoryPath.length - 1] : null;

  const renderCategoryLevel = useCallback((categoriesArray: ICategoryTree[], level: number = 0) => {
    return categoriesArray.map((category) => (
      <div key={category.id}>
        <Button
          variant="ghost"
          onClick={() => handleCategorySelect(category.id)}
          className={cn(
            "w-full justify-start text-left mb-1",
            level === 0 ? "font-medium" : "text-sm",
            level > 1 && "text-gray-600",
            selectedCategoryId === category.id && "bg-primary/10 text-primary font-medium"
          )}
          style={{ marginLeft: `${level * 16}px` }}
        >
          <span className="ml-2">{category.name}</span>
        </Button>

        {/* Recursively render children */}
        {category.children.length > 0 && (
          <div className="space-y-1">
            {renderCategoryLevel(category.children, level + 1)}
          </div>
        )}
      </div>
    ));
  }, [selectedCategoryId, handleCategorySelect]);

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center p-4", className)}>
        <div className="animate-pulse flex space-x-2">
          <div className="h-8 bg-gray-200 rounded-full w-20"></div>
          <div className="h-8 bg-gray-200 rounded-full w-24"></div>
          <div className="h-8 bg-gray-200 rounded-full w-16"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      {/* Mobile/Desktop Dropdown */}
      <div className="relative">
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-full justify-between text-left font-medium",
            selectedCategory && "bg-primary/5 border-primary/20"
          )}
        >
          <div className="flex items-center space-x-2">
            {selectedCategoryPath && selectedCategoryPath.length > 0 ? (
              <>
                <span className="truncate">
                  {selectedCategoryPath.map(cat => cat.name).join(' / ')}
                </span>
              </>
            ) : (
              <>
                <span>Todas las categorías</span>
              </>
            )}
          </div>
          <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
        </Button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
            <div className="p-2">
              {/* Clear selection option */}
              <Button
                variant="ghost"
                onClick={() => handleCategorySelect(null)}
                className={cn(
                  "w-full justify-start text-left font-medium mb-1",
                  !selectedCategoryId && "bg-primary/10 text-primary"
                )}
              >
                Todas las categorías
              </Button>
              
              {/* Categories */}
              {renderCategoryLevel(categories)}
            </div>
          </div>
        )}
      </div>

      {/* Selected category chip (when selected) */}
      {selectedCategoryPath && selectedCategoryPath.length > 0 && (
        <div className="mt-2 flex items-center space-x-2">
          <Badge
            variant="secondary"
            className={cn(
              "flex items-center space-x-1 px-3 py-1",
              getCategoryColor(true)
            )}
          >
            <span>{selectedCategoryPath.map(cat => cat.name).join(' / ')}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCategorySelect(null)}
              className="h-4 w-4 p-0 hover:bg-transparent"
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        </div>
      )}
    </div>
  );
}
