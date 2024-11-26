"use client"

import { IProduct } from "@/lib/backend/models/interfaces/product.interface"; // Add this import
import { useState } from 'react';
import ProductCard from './ProductCard'; // Add this import


interface RelatedProductsProps {
  brandName?: string;
  products: IProduct[];
}

export default function RelatedProducts({ brandName, products }: RelatedProductsProps) {
  const [startIndex, setStartIndex] = useState(0);
  const displayedProducts = products.slice(startIndex, startIndex + 4);
  const hasMoreProducts = products.length > startIndex + 4;
  const hasPreviousProducts = startIndex > 0;

  const handleNextClick = () => {
    setStartIndex((prevIndex) => Math.min(prevIndex + 4, products.length - 4));
  };

  const handlePreviousClick = () => {
    setStartIndex((prevIndex) => Math.max(prevIndex - 4, 0));
  };

  return (
    <section className="relative px-4 md:px-0"> {/* Add relative positioning and mobile-friendly padding */}
      {brandName && <h2 className="text-2xl mb-6">Otros productos de <span className="font-bold">{brandName}</span></h2>}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {displayedProducts.filter(product => product.status === "ACTIVE").map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      {hasPreviousProducts && (
        <button
          onClick={handlePreviousClick}
          className="absolute top-1/2 -left-4 md:-left-8 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md z-10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6 md:w-8 md:h-8">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="sr-only">Previous</span>
        </button>
      )}
      {hasMoreProducts && (
        <button
          onClick={handleNextClick}
          className="absolute top-1/2 -right-4 md:-right-8 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md z-10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6 md:w-8 md:h-8">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="sr-only">Next</span>
        </button>
      )}
    </section>
  );
}