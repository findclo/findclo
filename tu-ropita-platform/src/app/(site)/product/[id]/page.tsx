import BrandLink from '@/components/BrandLink';
import ImageGallery from '@/components/ImageGallery';
import ShareButtons from '@/components/ShareButtons';
import { ShoppingCart } from 'lucide-react';
import { notFound } from 'next/navigation';

// Simulating a server-side data fetch
async function getProductData(id: string) {
  // In a real application, this would be an API call or database query
  return {
    id: id,
    name: 'Floral Dress',
    brand: 'SummerChic',
    brandId: '1',
    brandImage: 'https://images.unsplash.com/photo-1490735891913-40897cdaafd1?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c3VtbWVyJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D',
    price: 49.99,
    description: 'This is where a detailed product description would go, highlighting the features and benefits of the item.',
    images: [
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZmxvcmFsJTIwZHJlc3N8ZW58MHx8MHx8fDA%3D',
      'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8ZmxvcmFsJTIwZHJlc3N8ZW58MHx8MHx8fDA%3D',
      'https://images.unsplash.com/photo-1596783074918-c84cb06531ca?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGZsb3JhbCUyMGRyZXNzfGVufDB8fDB8fHww',
      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fGZsb3JhbCUyMGRyZXNzfGVufDB8fDB8fHww',
    ],
  };
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await getProductData(params.id);

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
          <h2 className="text-xl font-semibold mb-2">{product.brand}</h2>
          <p className="text-2xl font-bold mb-4">${product.price.toFixed(2)}</p>
          <p className="mb-6">{product.description}</p>
          <div className="group">
            <button className="w-full bg-black text-white py-3 px-4 rounded mb-4 flex items-center justify-center transition-all duration-300 ease-in-out hover:bg-green-600 hover:scale-105 hover:shadow-lg">
              <ShoppingCart className="mr-2 transition-transform duration-300 ease-in-out group-hover:rotate-12" size={20} />
              Comprar
            </button>
          </div>

          <BrandLink
            brandId={product.brandId}
            brandName={product.brand}
            brandImage={product.brandImage}
          />

          <div className="flex justify-left mt-4">
            <ShareButtons productId={product.id} productName={product.name} />
          </div>
        </div>
      </div>
    </div>
  );
}
