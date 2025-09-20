'use client'

import { publicProductsApiWrapper } from "@/api-wrappers/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

export interface SearchBarProps {
  initialQuery: string;
  isHomePage?: boolean;
}

export function SearchBar({ initialQuery, isHomePage = false }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
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
        const queryParams = new URLSearchParams();
        queryParams.append('search', searchQuery.trim());
        router.push(`/search?${queryParams.toString()}`);
        setIsLoading(false);
      } catch (error) {
        console.error('Error during search:', error);
        setIsLoading(false);
      }
    }
  }, [searchQuery, router]);


  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex justify-center w-full mb-4">
        <form 
          onSubmit={handleSearch} 
          className="flex w-full items-center space-x-2 bg-white shadow-lg rounded-full p-2 focus-within:ring-2 focus-within:ring-details focus-within:ring-offset-2 transition-shadow"
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
        </form>
      </div>

      
    </div>
  );
}