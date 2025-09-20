import { publicProductsApiWrapper } from "@/api-wrappers/products";
import RelatedProducts from "@/components/RelatedProducts";
import { SearchBar } from "@/components/SearchBar";
import SearchResults from "@/components/SearchResults";
import { IProduct } from "@/lib/backend/models/interfaces/product.interface";

interface SearchPageProps {
    searchParams: {
        search?: string;
        skipAI?: boolean;
    };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
    const query = searchParams.search || '';

    let products: IProduct[] = [];
    let noProductsFound = false;

    try {
        const result = await publicProductsApiWrapper.getFilteredProducts(query, { skipAI: searchParams.skipAI });
        if (result && result.products.length > 0) {
            result.products = result.products.filter(p => p.status !== 'DELETED' && p.status !== 'PAUSED' && p.status !== 'PAUSED_BY_ADMIN');
        }

        if (!result || result.products.length === 0) {
            noProductsFound = true;
        } else {
            products = result.products;
        }
    } catch (error) {
        console.error('Error fetching products:', error);
        noProductsFound = true;
    }

    let recommendedProducts: IProduct[] = [];
    try {
        const result = await publicProductsApiWrapper.getFeaturedProducts(false, query);
        if (result && result.products.length > 0) {
            result.products = result.products.filter(p => p.status !== 'DELETED' && p.status !== 'PAUSED' && p.status !== 'PAUSED_BY_ADMIN');
        }
        
        if (result && result.products.length > 0) {
            recommendedProducts = result.products;
        }
    } catch (error) {
        console.error('Error fetching featured products:', error);
    }

    return (
        <>
            <div className="mb-8">
                <SearchBar
                    initialQuery={query}
                />
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                <div className="w-full">
                    {noProductsFound && recommendedProducts.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-xl text-gray-600">No se encontraron productos para la búsqueda especificada</p>
                        </div>
                    ) : (
                        <>
                            {recommendedProducts.length > 0 && (
                                <>
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2 sm:gap-0">
                                        <h2 className="text-2xl sm:text-3xl mt-4 sm:mt-0">Nosotros recomendamos</h2>
                                    </div>
                                    {recommendedProducts.length > 0 && (
                                        <div className="mt-4">
                                            <RelatedProducts 
                                                brandName={""} 
                                                products={recommendedProducts} 
                                            />
                                        </div>
                                    )}
                                </>
                            )}
                            {!noProductsFound && (
                                <div className="mt-8">
                                    <SearchResults products={products} />
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
