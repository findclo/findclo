import SearchFilters from "@/components/SearchFilters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

export function SearchBar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const router = useRouter();

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const queryParams = new URLSearchParams({ q: searchQuery.trim(), ...filters });
      router.push(`/search?${queryParams}`);
      // Close the keyboard by blurring the active element
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    }
  }, [searchQuery, filters, router]);

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex justify-center w-full mb-4">
        <form onSubmit={handleSearch} className="flex w-full items-center space-x-2">
          <Input
            type="search"
            placeholder="¿Qué estás buscando hoy?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-grow text-base placeholder:text-sm md:placeholder:text-base"
            enterKeyHint="search"
          />
          <Button type="submit" size="sm" className="h-10 w-10 p-0">
            <Search className="h-4 w-4" />
            <span className="sr-only">Buscar</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-10 w-10 p-0"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            aria-label={isFilterOpen ? 'Ocultar Filtros' : 'Mostrar Filtros'}
          >
            <Filter className="h-4 w-4" />
          </Button>
        </form>
      </div>
      {isFilterOpen && (
        <div className="w-full mx-auto">
          <SearchFilters 
            filters={filters} 
            setFilters={setFilters}
          />
        </div>
      )}
    </div>
  );
}