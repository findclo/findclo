'use client'

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Filter, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

interface Filters {
  minPrice?: number;
  maxPrice?: number;
  categories?: string[];
}

export interface SearchBarProps {
  initialQuery: string;
  initialFilters: Filters;
}

export function SearchBar({ initialQuery, initialFilters }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const queryParams = new URLSearchParams();
      queryParams.append('q', searchQuery.trim());

      if (filters.minPrice !== undefined) queryParams.append('minPrice', filters.minPrice.toString());
      if (filters.maxPrice !== undefined) queryParams.append('maxPrice', filters.maxPrice.toString());
      if (filters.categories && filters.categories.length > 0) {
        filters.categories.forEach(category => queryParams.append('category', category));
      }

      router.push(`/search?${queryParams.toString()}`);
      // Close the keyboard by blurring the active element
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    }
  }, [searchQuery, filters, router]);

  const handlePriceChange = (value: number[]) => {
    setFilters(prev => ({ ...prev, minPrice: value[0], maxPrice: value[1] }));
  };

  const handleCategoryChange = (category: string, checked: boolean) => {
    setFilters(prev => {
      const updatedCategories = checked
        ? [...(prev.categories || []), category]
        : (prev.categories || []).filter((c: string) => c !== category);
      return { ...prev, categories: updatedCategories };
    });
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex justify-center w-full mb-4">
        <form 
          onSubmit={handleSearch} 
          className="flex w-full items-center space-x-2 bg-white shadow-lg rounded-full p-2 focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 transition-shadow"
        >
          <Input
            ref={inputRef}
            type="search"
            placeholder="¿Qué estás buscando hoy?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-grow text-base placeholder:text-sm md:placeholder:text-base border-none focus:outline-none focus:ring-0 focus:ring-offset-0 !important"
            style={{ boxShadow: 'none' }}
            enterKeyHint="search"
            autoFocus
          />
          <Button type="submit" size="sm" className="h-10 w-10 p-0 rounded-full bg-primary hover:bg-primary/90">
            <Search className="h-4 w-4 text-white" />
            <span className="sr-only">Buscar</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-10 w-10 p-0 rounded-full border-2 border-gray-300 hover:bg-gray-100"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            aria-label={isFilterOpen ? 'Ocultar Filtros' : 'Mostrar Filtros'}
          >
            <Filter className="h-4 w-4" />
          </Button>
        </form>
      </div>
      {isFilterOpen && (
        <div className="w-full mx-auto mt-4">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Precio</h3>
              <Slider
                defaultValue={[0, 1000]}
                max={1000}
                step={10}
                onValueChange={handlePriceChange}
              />
              <div className="flex justify-between mt-2">
                <span>${filters.minPrice ?? 0}</span>
                <span>${filters.maxPrice ?? 1000}</span>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Categorías</h3>
              {['Camisetas', 'Pantalones', 'Vestidos', 'Accesorios'].map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={category}
                    checked={(filters.categories || []).includes(category)}
                    onCheckedChange={(checked) => handleCategoryChange(category, checked as boolean)}
                  />
                  <label htmlFor={category}>{category}</label>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}