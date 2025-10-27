import { publicProductsApiWrapper } from "@/api-wrappers/products";
import { Carousel } from "@/components/Carousel";
import { SearchBar } from "@/components/SearchBar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IProduct } from "@/lib/backend/models/interfaces/product.interface";
import { Shield, Store, Tags } from "lucide-react";

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
  const featuredProducts = (await publicProductsApiWrapper.getFeaturedProducts(true))?.products.filter(p => p.status !== 'DELETED' && p.status !== 'PAUSED' && p.status !== 'PAUSED_BY_ADMIN');
  const carouselItems = featuredProducts ? mapProductsToCarouselItems(featuredProducts) : [];

  return (
    <>
      <div className="mt-4">
        <SearchBar initialQuery={""}  isHomePage={true} />
      </div>

      {carouselItems.length > 0? (
        <>
          <div className="h-32 md:h-24 flex items-center justify-center mt-20">
            <h2 className="text-2xl md:text-3xl text-center text-gray-800 px-4">
              Encontrá el producto que buscas
            </h2>
          </div>
          
          <div className="container mx-auto px-4">
            <Carousel items={carouselItems} />
          </div>
        </>
      ) : (
        <div className="container mx-auto px-4 mt-12 md:mt-20">
          <Card className="border-none bg-transparent shadow-none">
            <CardHeader className="text-center space-y-6 pb-2">
              <div className="relative group cursor-default">
                <div className="relative">
                  <CardTitle className="text-7xl md:text-9xl font-bold">
                    <span className="relative inline-block">
                      <span className="absolute -inset-2 bg-details/10 blur-xl rounded-lg"></span>
                      <span className="relative text-details drop-shadow-[0_4px_3px_rgba(0,0,0,0.4)]">find</span>
                    </span>
                    <span className="relative ml-1">
                      <span className="relative text-foreground">clo</span>
                      <span className="absolute bottom-0 left-0 w-full h-[6px] bg-details rounded-full"></span>
                    </span>
                  </CardTitle>
                </div>
                <div className="absolute -z-10 inset-0 bg-gradient-to-r from-details/5 to-transparent blur-2xl transform transition-all duration-300 group-hover:scale-110"></div>
              </div>
              <CardDescription className="text-xl md:text-2xl text-gray-700 animate-in slide-in-from-bottom-4 fade-in duration-1000 delay-200 fill-mode-both">
                Descubrí las mejores marcas en un solo lugar
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-8 pb-12">
              <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <Card className="hover:shadow-lg transition-shadow border-none animate-in slide-in-from-bottom-4 fade-in duration-1000 fill-mode-both order-1" style={{ animationDelay: '400ms' }}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Store className="text-details" size={20} />
                      Marcas Destacadas
                    </CardTitle>
                    <CardDescription>
                      Explora una cuidadosa selección de las mejores marcas nacionales e internacionales
                    </CardDescription>
                  </CardHeader>
                </Card>
                <Card className="hover:shadow-lg transition-shadow border-none animate-in slide-in-from-bottom-4 fade-in duration-1000 fill-mode-both order-2" style={{ animationDelay: '700ms' }}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Tags className="text-details" size={20} />
                      Compra Inteligente
                    </CardTitle>
                    <CardDescription>
                      Compara precios y encuentra las mejores ofertas en un solo lugar
                    </CardDescription>
                  </CardHeader>
                </Card>
                <Card className="hover:shadow-lg transition-shadow border-none animate-in slide-in-from-bottom-4 fade-in duration-1000 fill-mode-both order-3" style={{ animationDelay: '1000ms' }}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Shield className="text-details" size={20} />
                      Garantía de Calidad
                    </CardTitle>
                    <CardDescription>
                      Productos originales y garantizados de todas las marcas
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}