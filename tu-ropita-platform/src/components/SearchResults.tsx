"use client";

import { IProduct } from "@/lib/backend/models/interfaces/product.interface";
import { useSearchParams } from "next/navigation";
import ProductCard from './ProductCard'; // Add this import

interface SearchResultsProps {
  products: IProduct[];
}

export default function SearchResults({ products }: SearchResultsProps) {
  const searchParams = useSearchParams();
  const query = searchParams.get("q");

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-xl mb-6">Resultados de búsqueda para: <span className="italic">`{query}`</span></h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}