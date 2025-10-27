import { publicProductsApiWrapper } from "@/api-wrappers/products";
import RelatedProducts from "@/components/RelatedProducts";
import { SearchBar } from "@/components/SearchBar";
import SearchResults from "@/components/SearchResults";
import { ProductFilters } from "@/components/ProductFilters";
import { IProduct } from "@/lib/backend/models/interfaces/product.interface";

interface SearchPageProps {
    searchParams: {
        search?: string;
        categoryId?: string;
        skipAI?: boolean;
        [key: string]: string | boolean | undefined; // Allow any additional params for attribute filters
    };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
    const query = searchParams.search || '';
    const categoryId = searchParams.categoryId ? parseInt(searchParams.categoryId, 10) : null;

    let products: IProduct[] = [];
    let noProductsFound = false;
    let attributes: any[] = [];

    try {
        // Build filters object including all params (for attribute filters)
        const filters: any = { skipAI: searchParams.skipAI };
        if (categoryId) {
            filters.categoryId = categoryId;
        }

        // Add all other params (attribute filters)
        Object.entries(searchParams).forEach(([key, value]) => {
            if (key !== 'search' && key !== 'categoryId' && key !== 'skipAI' && value !== undefined) {
                filters[key] = value;
            }
        });

        const result = await publicProductsApiWrapper.getFilteredProducts(query, filters);
        if (result && result.products.length > 0) {
            result.products = result.products.filter(p => p.status !== 'DELETED' && p.status !== 'PAUSED' && p.status !== 'PAUSED_BY_ADMIN');
        }

        if (!result || result.products.length === 0) {
            noProductsFound = true;
        } else {
            products = result.products;
            attributes = result.attributes || [];
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
            <div className="mt-4 mb-8">
                <SearchBar
                    initialQuery={query}
                    categoryId={categoryId}
                />
            </div>

            <div className="flex gap-6">
                {/* Filtros - Desktop sidebar */}
                {attributes.length > 0 && (
                    <ProductFilters attributes={attributes} />
                )}

                {/* Contenido principal */}
                <div className="flex-1">
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
