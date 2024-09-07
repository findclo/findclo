"use client";

import { useEffect, useState } from "react";
import SearchResults from "@/components/SearchResults";
import { Input } from "@/components/ui/input";
import { IProduct } from "@/lib/backend/models/interfaces/product.interface";
import { Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import globalSettings from "@/lib/settings";

async function getProducts(query: string): Promise<IProduct[]> {
    const res = await fetch(`${globalSettings.BASE_URL}/api/products?search=${encodeURIComponent(query)}`, { cache: 'no-store' });
    if (!res.ok) {
        throw new Error('Failed to fetch products');
    }
    return res.json();
}

export default function SearchPage() {
    const [query, setQuery] = useState("");
    const [recommendedProducts, setRecommendedProducts] = useState<IProduct[]>([]);

    useEffect(() => {
        // Fetch products whenever the query changes
        const fetchProducts = async () => {
            const products = await getProducts(query);
            setRecommendedProducts(products.slice(0, 4));
        };

        fetchProducts();
    }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Update the URL with the new search query
    window.history.pushState({}, "", `/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <form onSubmit={handleSearch} className="mb-8">
        <div className="relative">
          <Input 
            type="search" 
            placeholder="¿Qué estás buscando hoy?" 
            className="w-full pl-12 pr-4 py-3 text-lg border-2 border-primary rounded-full shadow-lg focus:ring-4 focus:ring-primary/20 transition-all duration-300"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <Search className="text-primary w-6 h-6" />
          </button>
        </div>
      </form>

      <h2 className="text-3xl mb-4">🚀 Recomendados</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {recommendedProducts.map((product) => (
          <Link href={`/product/${product.id}`} key={product.id} className="group">
            <div className={`border rounded-lg overflow-hidden transition-all duration-300 group-hover:shadow-lg`}>
              <Image
                src={product.images[0]}
                alt={product.name}
                width={300}
                height={300}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                <p className="text-gray-600">${product.price.toFixed(2)}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

            <SearchResults products={recommendedProducts} />
        </div>
    );
}
