"use client"

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react'; // Add this import

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
}

interface RelatedProductsProps {
  brandName: string;
  products: Product[];
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
      <h2 className="text-2xl mb-6">Otros productos de <span className="font-bold">{brandName}</span></h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {displayedProducts.map((product) => (
          <Link href={`/product/${product.id}`} key={product.id} className="group">
            <div className={`border rounded-lg overflow-hidden transition-all duration-300 group-hover:shadow-lg`}>
              <Image
                src={product.image}
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