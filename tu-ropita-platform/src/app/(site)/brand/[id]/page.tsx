import ProductCard from '@/components/ProductCard'; // Add this import
import { Button } from "@/components/ui/button";
import { IBrand } from "@/lib/backend/models/interfaces/brand.interface";
import { IProduct } from "@/lib/backend/models/interfaces/product.interface";
import globalSettings from '@/lib/settings';
import Image from 'next/image';
import Link from 'next/link';

async function getProducts(query: string, filters: any): Promise<IProduct[]> {
    const queryParams = new URLSearchParams({ search: query, ...filters });
    const res = await fetch(`${globalSettings.BASE_URL}/api/products?${queryParams}`, { cache: 'no-store' });
    if (!res.ok) {
        throw new Error('Failed to fetch products');
    }
    return res.json();
}

const mockBrand: IBrand = {
  id: 1,
  name: 'Zara',
  image: 'https://images.unsplash.com/photo-1578401079419-1ab3f3b339ae?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
};

const mockProductsOfBrand: IProduct[] = [
  { 
    id: '1', 
    name: 'Product 1', 
    price: 19.99, 
    description: 'Description for Product 1',
    images: ['/placeholder-product.jpg'],
    brand: mockBrand,
  },
  { 
    id: '2', 
    name: 'Product 2', 
    price: 29.99, 
    description: 'Description for Product 2',
    images: ['/placeholder-product.jpg'],
    brand: mockBrand,
  },
];

async function BrandPage({ params }: { params: { id: string } }) {
  // TODO: Implement fetching brand data
  const brand = { ...mockBrand, id: params.id };
  
  // Use the getProducts function to fetch products
  const products = await getProducts('', { brandId: params.id });

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
}

export default BrandPage;
