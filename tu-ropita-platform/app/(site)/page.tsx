import { productsApiWrapper } from "@/api-wrappers/products";
import { Carousel } from "@/components/Carousel";
import { SearchBar } from "@/components/SearchBar";
import { IProduct } from "@/lib/backend/models/interfaces/product.interface";

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

export default async function Home() {
  const featuredProducts = await productsApiWrapper.getFeaturedProducts();
  const carouselItems = featuredProducts ? mapProductsToCarouselItems(featuredProducts.products) : [];

  return (
    <>
      <SearchBar initialQuery={""} initialFilters={{}} />

      <div className="h-32 md:h-24 flex items-center justify-center mt-20">
        <h2 className="text-2xl md:text-3xl text-center text-gray-800 px-4">
          Encontrá el producto que buscas
        </h2>
      </div>
      
      <div className="container mx-auto px-4">
        <Carousel items={carouselItems} />
      </div>
      
      {/* <div className="flex justify-center">
        <FeaturedBrands />
      </div> */}
    </>
  );
}