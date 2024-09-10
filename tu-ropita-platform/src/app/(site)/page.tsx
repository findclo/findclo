"use client";

import { Carousel } from "@/components/Carousel";
import { FeaturedBrands } from "@/components/FeaturedBrands";
import { SearchBar } from "@/components/SearchBar";
import { IProduct } from "@/lib/backend/models/interfaces/product.interface";
import globalSettings from "@/lib/settings";
import { Suspense, useEffect, useState } from "react";

async function getFeaturedProducts(): Promise<IProduct[]> {
  const res = await fetch(`${globalSettings.BASE_URL}/api/products?featured=true`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Failed to fetch featured products');
  }
  return res.json();
}

interface CarouselItem {
  id: string;
  src: string;
  alt: string;
}

function mapProductsToCarouselItems(products: IProduct[]): CarouselItem[] {
  return products.map(product => ({
    id: product.id.toString(),
    src: product.images[0] || '',
    alt: product.name
  }));
}

function CarouselWrapper({ items }: { items: CarouselItem[] }) {
  if (items.length === 0) {
    return <div className="text-center text-gray-500 mt-24 mb-24">Cargando...</div>;
  }
  return <Carousel items={items} />;
}

export default function Home() {
  const [carouselItems, setCarouselItems] = useState<CarouselItem[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const featuredProducts = await getFeaturedProducts();
        const mappedItems = mapProductsToCarouselItems(featuredProducts);
        setCarouselItems(mappedItems);
      } catch (error) {
        console.error('Error fetching featured products:', error);
      }
    };

    fetchProducts();
  }, []);

  return (
    <>
      <SearchBar />
      
      <div className="flex justify-center">
        <Suspense fallback={<div>Loading...</div>}>
          <CarouselWrapper items={carouselItems} />
        </Suspense>
      </div>
      
      <div className="flex justify-center">
        <FeaturedBrands />
      </div>
    </>
  );
}