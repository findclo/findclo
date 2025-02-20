import { publicBrandsApiWrapper } from '@/api-wrappers/brands';
import { publicProductsApiWrapper } from '@/api-wrappers/products';
import { Button } from "@/components/ui/button";
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ProductsSection from './ProductsSection';

async function BrandPage({ params }: { params: { id: string } }) {
  try {
    const brand = await publicBrandsApiWrapper.getBrandById(params.id);
    if (!brand || (brand && brand.status === 'PAUSED')) {
      notFound();
    }

    let products = await publicProductsApiWrapper.getProductsByBrandId(params.id);

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

        {brand.description && (
          <>
            <h2 className="text-2xl font-semibold mb-4">Descripción de la marca</h2>
            <p className="text-gray-600 mb-8">{brand.description}</p>
          </>
        )}

{products ? (
          <ProductsSection products={products.products} />
        ) : (
          <div>Nada que ver por aquí...</div>
        )}
      </div>
    );
  } catch (error) {
    notFound();
  }
}

export default BrandPage;
