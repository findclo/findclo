"use client";

import SearchResults from "@/components/SearchResults";
import { Input } from "@/components/ui/input";
import { IProduct } from "@/lib/backend/models/interfaces/product.interface";
import { Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const mockProducts: IProduct[] = [
    { id: '2', description:' ' , brand: {id:1, name:'mock brand', image:'https://images.unsplash.com/photo-1490735891913-40897cdaafd1?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c3VtbWVyJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D'}, name: 'Summer Blouse', price: 39.99, images: ['https://images.unsplash.com/photo-1560253023-3ec5d502959f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c3VtbWVyJTIwYmxvdXNlfGVufDB8fDB8fHww'] },
    { id: '3', description:' ' , brand: {id:'1', name:'mock brand', image:'https://images.unsplash.com/photo-1490735891913-40897cdaafd1?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c3VtbWVyJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D'}, name: 'Floral Skirt', price: 29.99, images: ['https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZmxvcmFsJTIwc2tpcnR8ZW58MHx8MHx8fDA%3D'] },
    { id: '4', description:' ' , brand: {id:'1', name:'mock brand', image:'https://images.unsplash.com/photo-1490735891913-40897cdaafd1?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c3VtbWVyJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D'}, name: 'Striped Tee', price: 24.99, images: [ 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c3RyaXBlZCUyMHRlZXxlbnwwfHwwfHx8MA%3D%3D'] },
    { id: '5', description:' ' , brand: {id:2, name:'mock brand', image:'https://images.unsplash.com/photo-1490735891913-40897cdaafd1?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c3VtbWVyJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D'}, name: 'Denim Jacket', price: 59.99, images: [ 'https://images.unsplash.com/photo-1544642899-f0d6e5f6ed6f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZGVuaW0lMjBqYWNrZXR8ZW58MHx8MHx8fDA%3D'] },
    { id: '6', description:' ' , brand: {id:3, name:'mock brand', image:'https://images.unsplash.com/photo-1490735891913-40897cdaafd1?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c3VtbWVyJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D'}, name: 'Boho Dress', price: 49.99, images: [ 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Ym9obyUyMGRyZXNzfGVufDB8fDB8fHww'] },
    { id: '7', description:' ' , brand: {id:4, name:'mock brand', image:'https://images.unsplash.com/photo-1490735891913-40897cdaafd1?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c3VtbWVyJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D'}, name: 'Leather Boots', price: 89.99, images: [ 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bGVhdGhlciUyMGJvb3RzfGVufDB8fDB8fHww'] },
    { id: '8', description:' ' , brand: {id:5, name:'mock brand', image:'https://images.unsplash.com/photo-1490735891913-40897cdaafd1?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c3VtbWVyJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D'}, name: 'Silk Scarf', price: 19.99, images: [ 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c2lsayUyMHNjYXJmfGVufDB8fDB8fHww'] },
    { id: '9', description:' ' , brand: {id:6, name:'mock brand', image:'https://images.unsplash.com/photo-1490735891913-40897cdaafd1?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c3VtbWVyJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D'}, name: 'Vintage Sunglasses', price: 34.99, images: [ 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dmludGFnZSUyMHN1bmdsYXNzZXN8ZW58MHx8MHx8fDA%3D'] },
  ];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [recommendedProducts, setRecommendedProducts] = useState<IProduct[]>(mockProducts.slice(0, 4));

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

      <SearchResults products={mockProducts} />
    </div>
  );
}
