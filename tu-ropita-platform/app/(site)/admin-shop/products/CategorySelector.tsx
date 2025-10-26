"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ICategoryTree } from "@/lib/backend/models/interfaces/category.interface";
import { publicCategoriesApiWrapper } from "@/api-wrappers/categories";
import { ChevronRight, ChevronDown, Tags, Info } from "lucide-react";
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

  // Helper to check if any descendant category is selected
  const hasAnySelectedDescendant = useCallback(
    (categoriesTree: ICategoryTree[], selectedIds: Set<number>): boolean => {
      return categoriesTree.some(cat => {
        if (selectedIds.has(cat.id)) return true;
        if (cat.children.length > 0) {
          return hasAnySelectedDescendant(cat.children, selectedIds);
        }
        return false;
      });
    },
    []
  );

  // Helper function to find parent categories of selected categories
  const findParentCategories = useCallback(
    (categoriesTree: ICategoryTree[], selectedIds: Set<number>, parentIds: Set<number> = new Set()): Set<number> => {
      categoriesTree.forEach(category => {
        if (category.children.length > 0) {
          // Check if any child (recursively) is selected
          const hasSelectedChild = hasAnySelectedDescendant(category.children, selectedIds);
          if (hasSelectedChild) {
            parentIds.add(category.id);
          }
          // Recursively process children
          findParentCategories(category.children, selectedIds, parentIds);
        }
      });
      return parentIds;
    },
    [hasAnySelectedDescendant]
  );

  // Auto-expand parent categories when selected categories change
  useEffect(() => {
    if (categories.length > 0 && selectedCategories.size > 0) {
      const parentIds = findParentCategories(categories, selectedCategories);
      setExpandedCategories(prevExpanded => {
        const newExpanded = new Set(prevExpanded);
        parentIds.forEach(id => newExpanded.add(id));
        return newExpanded;
      });
    }
  }, [categories, selectedCategories, findParentCategories]);

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
              !isLeaf && "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
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
              <div className="flex-1 min-w-0 flex items-center gap-2">
                <div className="flex-1">
                  <h3
                    className={cn(
                      "text-sm font-medium truncate",
                      isLeaf
                        ? "text-gray-900 dark:text-white"
                        : "text-gray-700 dark:text-gray-300"
                    )}
                  >
                    {category.name}
                  </h3>
                  {!isLeaf && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Contiene subcategorías
                    </p>
                  )}
                </div>
                {isLeaf && (
                  <Badge variant="outline" className="text-xs bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300">
                    Seleccionable
                  </Badge>
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
          <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <AlertDescription className="text-sm text-blue-800 dark:text-blue-200">
              Solo puedes seleccionar categorías que no tengan subcategorías (marcadas como "Seleccionable")
            </AlertDescription>
          </Alert>
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
