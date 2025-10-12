"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { ICategoryTree } from "@/lib/backend/models/interfaces/category.interface";
import { publicCategoriesApiWrapper } from "@/api-wrappers/categories";
import { ChevronRight, ChevronDown, Tags } from "lucide-react";
import { cn } from "@/lib/utils";

interface CategorySelectorProps {
  selectedCategories: Set<number>;
  onCategoriesChange: (categories: Set<number>) => void;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategories,
  onCategoriesChange,
}) => {
  const [categories, setCategories] = useState<ICategoryTree[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  const [categorySearchQuery, setCategorySearchQuery] = useState("");
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      if (categories.length === 0) {
        setIsLoadingCategories(true);
        try {
          const response = await publicCategoriesApiWrapper.getCategoryTree();
          if (response) {
            setCategories(response.categories);
          }
        } catch (error) {
          console.error("Error fetching categories:", error);
        } finally {
          setIsLoadingCategories(false);
        }
      }
    };

    fetchCategories();
  }, [categories.length]);

  // Helper functions
  const isLeafCategory = useCallback((category: ICategoryTree): boolean => {
    return category.children.length === 0;
  }, []);

  const toggleCategorySelection = useCallback(
    (categoryId: number, category: ICategoryTree) => {
      if (!isLeafCategory(category)) {
        return; // Only leaf categories can be selected
      }

      const newSet = new Set(selectedCategories);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      onCategoriesChange(newSet);
    },
    [isLeafCategory, selectedCategories, onCategoriesChange]
  );

  const toggleCategoryExpansion = useCallback((categoryId: number) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  }, []);

  const filterCategoriesByQuery = useCallback(
    (categories: ICategoryTree[], query: string): ICategoryTree[] => {
      if (!query) return categories;

      return categories
        .filter((category) => {
          const matches =
            category.name.toLowerCase().includes(query.toLowerCase()) ||
            category.description?.toLowerCase().includes(query.toLowerCase());

          if (matches) return true;

          if (category.children.length > 0) {
            const matchingChildren = filterCategoriesByQuery(
              category.children,
              query
            );
            return matchingChildren.length > 0;
          }

          return false;
        })
        .map((category) => ({
          ...category,
          children:
            category.children.length > 0
              ? filterCategoriesByQuery(category.children, query)
              : [],
        }));
    },
    []
  );

  const filteredCategories = useMemo(() => {
    return filterCategoriesByQuery(categories, categorySearchQuery);
  }, [categories, categorySearchQuery, filterCategoriesByQuery]);

  const renderCategoryItem = useCallback(
    (category: ICategoryTree, level: number = 0) => {
      const hasChildren = category.children.length > 0;
      const isExpanded = expandedCategories.has(category.id);
      const isSelected = selectedCategories.has(category.id);
      const isLeaf = isLeafCategory(category);

      return (
        <div key={category.id} className="category-item">
          <div
            className={cn(
              "flex items-center p-2 rounded-lg border transition-all duration-200",
              "hover:bg-gray-50 dark:hover:bg-gray-800",
              isSelected &&
                "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
              !isLeaf && "opacity-60"
            )}
            style={{ marginLeft: `${level * 16}px` }}
          >
            {/* Expand/Collapse Button */}
            {hasChildren && (
              <button
                onClick={() => toggleCategoryExpansion(category.id)}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded mr-2"
                type="button"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            )}

            {/* Checkbox for leaf categories only */}
            <div className="flex items-center space-x-2 flex-1">
              <Checkbox
                checked={isSelected}
                disabled={!isLeaf}
                onCheckedChange={() =>
                  toggleCategorySelection(category.id, category)
                }
                className={cn(!isLeaf && "cursor-not-allowed opacity-50")}
              />
              <div className="flex-1 min-w-0">
                <h3
                  className={cn(
                    "text-sm font-medium truncate",
                    isLeaf
                      ? "text-gray-900 dark:text-white"
                      : "text-gray-500 dark:text-gray-400"
                  )}
                >
                  {category.name}
                </h3>
                {!isLeaf && (
                  <p className="text-xs text-gray-400">
                    Contiene subcategorías
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Children */}
          {hasChildren && isExpanded && (
            <div className="mt-1">
              {category.children.map((child) =>
                renderCategoryItem(child, level + 1)
              )}
            </div>
          )}
        </div>
      );
    },
    [
      expandedCategories,
      selectedCategories,
      isLeafCategory,
      toggleCategoryExpansion,
      toggleCategorySelection,
    ]
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <Tags className="w-4 h-4 text-gray-500" />
        <Input
          placeholder="Buscar categorías..."
          value={categorySearchQuery}
          onChange={(e) => setCategorySearchQuery(e.target.value)}
          className="flex-1"
        />
        {selectedCategories.size > 0 && (
          <Badge variant="secondary">{selectedCategories.size}</Badge>
        )}
      </div>
      {isLoadingCategories ? (
        <div className="text-center py-4 text-sm text-gray-500">
          Cargando categorías...
        </div>
      ) : (
        <>
          <p className="text-xs text-gray-500">
            Solo puedes seleccionar categorías que no tengan subcategorías
          </p>
          <ScrollArea className="h-[300px] rounded-md border p-2">
            <div className="space-y-1">
              {filteredCategories.length > 0 ? (
                filteredCategories.map((category) => renderCategoryItem(category))
              ) : (
                <p className="text-center text-sm text-gray-500 py-4">
                  No se encontraron categorías
                </p>
              )}
            </div>
          </ScrollArea>
        </>
      )}
    </div>
  );
};
