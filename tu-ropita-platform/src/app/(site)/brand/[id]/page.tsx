import ProductCard from '@/components/ProductCard'; // Add this import
import { Button } from "@/components/ui/button";
import { IBrand } from "@/lib/backend/models/interfaces/brand.interface";
import { IProduct } from "@/lib/backend/models/interfaces/product.interface";
import globalSettings from '@/lib/settings';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {IListProductResponseDto} from "@/lib/backend/dtos/listProductResponse.dto.interface"; // Add this import

async function getProducts(query: string, filters: any): Promise<IListProductResponseDto> {
    const queryParams = new URLSearchParams({ search: query, ...filters });
    const res = await fetch(`${globalSettings.BASE_URL}/api/products?${queryParams}`, { cache: 'no-store' });
    if (!res.ok) {
        throw new Error('Failed to fetch products');
    }
    return res.json();
}

async function getBrand(id: string): Promise<IBrand> {
    const res = await fetch(`${globalSettings.BASE_URL}/api/brands/${id}`, { cache: 'no-store' });
    if (!res.ok) {
        throw new Error('Failed to fetch brand');
    }
    return res.json();
}


async function BrandPage({ params }: { params: { id: string } }) {
  try {
    const brand = await getBrand(params.id);
    const products = (await getProducts('', { brandId: params.id })).products;

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center mb-8">
          <div className="flex items-center">
            <div className="w-48 h-48 flex-shrink-0 mr-8">
              <Image
                src={brand.image}
                alt={brand.name}
                width={192}
                height={192}
                className="rounded-full object-cover w-full h-full"
              />
            </div>
            <div className="flex flex-col">
              <h1 className="text-3xl font-bold mb-4">{brand.name}</h1>
              <Button asChild>
                <Link
                  href={brand.websiteUrl || ""}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Página de la marca
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-semibold mb-4">Productos de la marca</h2>
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    );
  } catch (error) {
    notFound();
  }
}

export default BrandPage;
