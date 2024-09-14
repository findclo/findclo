import { productsApiWrapper } from "@/api-wrappers/products";
import ProductCard from "@/components/ProductCard";
import { SearchBar } from "@/components/SearchBar";
import SearchResults from "@/components/SearchResults";
import { IProduct } from "@/lib/backend/models/interfaces/product.interface";

interface SearchPageProps {
    searchParams: {
        q?: string;
        minPrice?: string;
        maxPrice?: string;
        category?: string | string[];
    };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
    const query = searchParams.q || '';
    const filters = {
        minPrice: searchParams.minPrice ? parseInt(searchParams.minPrice) : undefined,
        maxPrice: searchParams.maxPrice ? parseInt(searchParams.maxPrice) : undefined,
        categories: Array.isArray(searchParams.category) ? searchParams.category : searchParams.category ? [searchParams.category] : undefined,
    };

    let products: IProduct[] = [];
    let noProductsFound = false;

    try {
        const result = await productsApiWrapper.getFilteredProducts(query, filters);
        if (!result || result.products.length === 0) {
            noProductsFound = true;
        } else {
            products = result.products;
        }
    } catch (error) {
        console.error('Error fetching products:', error);
        noProductsFound = true;
    }

    return (
        <>
            <div className="mb-8">
                <SearchBar initialQuery={query} initialFilters={filters} />
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                <div className="w-full">
                    {noProductsFound ? (
                        <div className="text-center py-8">
                            <p className="text-xl text-gray-600">No se encontraron productos para la búsqueda especificada</p>
                        </div>
                    ) : (
                        <>
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2 sm:gap-0">
                                <h2 className="text-2xl sm:text-3xl mt-4 sm:mt-0">Nosotros recomendamos</h2>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                {products.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                            <SearchResults products={products} />
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
