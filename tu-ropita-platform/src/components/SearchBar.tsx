'use client'

import { publicProductsApiWrapper } from "@/api-wrappers/products";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

interface Tag {
  id: number;
  name: string;
  category_id: number;
}

export interface SearchBarProps {
  initialQuery: string;
  appliedTags: Tag[];
  availableTags: Tag[];
  isHomePage?: boolean;
}

export function SearchBar({ initialQuery, appliedTags, availableTags, isHomePage = false }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSearch = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      try {
        setIsLoading(true);
        const result = await publicProductsApiWrapper.getFilteredProducts(searchQuery.trim(), {});
        if (result && result.appliedTags) {
          const newTagsName = result.appliedTags.map(tag => tag.name);
          const queryParams = new URLSearchParams();
          newTagsName.forEach(name => queryParams.append('tags', name.toString()));
          router.push(`/search?${queryParams.toString()}`);
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching filtered products:', error);
      }
    }
  }, [searchQuery, router]);

  const handleTagClick = (tag: Tag) => {
    const queryParams = new URLSearchParams();
    const newTags = appliedTags.some(t => t.id === tag.id)
      ? appliedTags.filter(t => t.id !== tag.id)
      : [...appliedTags, tag];
    
    newTags.forEach(t => queryParams.append('tags', t.name.toString()));
    router.push(`/search?${queryParams.toString()}`);
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
            type="text"
            placeholder="¿Qué estás buscando hoy?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-grow text-base placeholder:text-sm md:placeholder:text-base border-none focus:outline-none focus:ring-0 focus:ring-offset-0 !important"
            style={{ boxShadow: 'none' }}
            enterKeyHint="search"
            autoFocus
          />
          <Button type="submit" size="sm" className="h-10 w-10 p-0 rounded-full bg-primary hover:bg-primary/90" disabled={isLoading}>
            {isLoading ? (
              <div className="spinner h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Search className="h-4 w-4 text-white" />
            )}
            <span className="sr-only">Buscar</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-10 w-10 p-0 rounded-full border-2 border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            aria-label={isFilterOpen ? 'Ocultar Filtros' : 'Mostrar Filtros'}
            disabled={isHomePage}  // Disable the button on the home page
          >
            <Filter className="h-4 w-4" />
          </Button>
        </form>
      </div>

      {isFilterOpen && (
        <div className="w-full mx-auto mt-4">
          <div className="flex space-x-6">
            {appliedTags.length > 0 && (
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">Tags Aplicados</h3>
                <div className="flex flex-wrap gap-2">
                  {appliedTags.map((tag) => (
                    <Badge key={tag.id} variant="secondary">
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {availableTags.length > 0 && (
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">Tags Disponibles</h3>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => (
                    <Badge key={tag.id} variant="outline" className="cursor-pointer hover:bg-secondary"
                           onClick={() => handleTagClick(tag)}>
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
    </div>
  );
}