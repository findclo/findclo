"use client";

import { IProduct } from "@/lib/backend/models/interfaces/product.interface";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

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
    </div>
  );
}