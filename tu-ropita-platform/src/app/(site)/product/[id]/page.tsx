import BrandLink from '@/components/BrandLink';
import ImageGallery from '@/components/ImageGallery';
import RelatedProducts from '@/components/RelatedProducts';
import ShareButtons from '@/components/ShareButtons';
import { IListProductResponseDto } from "@/lib/backend/dtos/listProductResponse.dto.interface";
import { IBrand } from '@/lib/backend/models/interfaces/brand.interface';
import globalSettings from "@/lib/settings";
import { ShoppingCart } from 'lucide-react';
import { notFound } from 'next/navigation';

async function getProduct(productId: string) {
  const res = await fetch(`${globalSettings.BASE_URL}/api/products?productId=${productId}`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Failed to fetch users');
  }
  return res.json();
}

async function getProductsOfBrand(brandId: number): Promise<IListProductResponseDto> {
  const res = await fetch(`${globalSettings.BASE_URL}/api/products?brandId=${brandId}`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Failed to fetch users');
  }
  return res.json();
}

async function getBrand(brandId: string): Promise<IBrand> {
  const res = await fetch(`${globalSettings.BASE_URL}/api/brands/${brandId}`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Failed to fetch users');
  }
  return res.json();
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = (await getProduct(params.id)).products[0];
  const brand = await getBrand(product.brand_id);
  const relatedProducts = (await getProductsOfBrand(brand.id)).products;

  // Handle case where product is not found
  if (!product) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/2">
          <ImageGallery images={product.images} productName={product.name} />
        </div>
        
        <div className="w-full md:w-1/2">
          <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
          <p className="text-2xl font-bold mb-4">${product.price}</p>
          <p className="mb-6">{product.description}</p>
          <div className="group">
            <button className="w-full bg-black text-white py-3 px-4 rounded mb-4 flex items-center justify-center transition-all duration-300 ease-in-out hover:bg-green-600 hover:scale-105 hover:shadow-lg">
              <ShoppingCart className="mr-2 transition-transform duration-300 ease-in-out group-hover:rotate-12" size={20} />
              Comprar
            </button>
          </div>

          <BrandLink
            brandId={brand.id.toString()}
            brandName={brand.name}
            brandImage={brand.image}
          />

          <div className="flex justify-left mt-4">
            <ShareButtons productId={product.id} productName={product.name} />
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div className="mt-12">
          <RelatedProducts 
            brandName={brand.name} 
            products={relatedProducts} 
          />
        </div>
      )}
    </div>
  );
}
