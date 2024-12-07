'use client';

import ProductCard from '@/components/ProductCard';
import { Input } from "@/components/ui/input";
import { IProduct } from '@/lib/backend/models/interfaces/product.interface';
import { useState } from 'react';

interface ProductsSectionProps {
  products: IProduct[];
}

export default function ProductsSection({ products }: ProductsSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredProducts = products.filter(p => 
    p.status !== 'DELETED' && 
    p.status !== 'PAUSED' && 
    p.status !== 'PAUSED_BY_ADMIN' &&
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Productos de la marca</h2>
        <div className="w-full md:w-1/3 mt-4 md:mt-0">
          <Input
            type="text"
            placeholder="Busca productos por nombre dentro de la tienda..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        ) : (
          <div>No se encontraron productos...</div>
        )}
      </div>
    </>
  );
}