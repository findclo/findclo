"use client";

import { productsApiWrapper } from "@/api-wrappers/products";
import ProductCard from "@/components/ProductCard";
import { SearchBar } from "@/components/SearchBar";
import SearchFilters from "@/components/SearchFilters";
import SearchResults from "@/components/SearchResults";
import { IProduct } from "@/lib/backend/models/interfaces/product.interface";
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from "react";

export default function SearchPage() {
    const [products, setProducts] = useState<IProduct[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [filters, setFilters] = useState({});
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const searchParams = useSearchParams();
    const [noProductsFound, setNoProductsFound] = useState(false);

    useEffect(() => {
        const fetchProducts = async () => {
            setIsLoading(true);
            setProducts([]);
            setNoProductsFound(false);
            const query = searchParams.get('q') || '';
            try {
                const result = await productsApiWrapper.getFilteredProducts(query, filters);
                console.log(result);
                if (result.products.length === 0) {
                    setNoProductsFound(true);
                } else {
                    setProducts(result.products);
                }
            } catch (error) {
                console.error('Error fetching products:', error);
                setNoProductsFound(true);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProducts();
    }, [filters, searchParams]);

    return (
        <>
            <div className="mb-8">
                <SearchBar />
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {isFilterOpen && (
                    <div className="w-full md:w-1/4">
                        <SearchFilters 
                            filters={filters} 
                            setFilters={setFilters}
                        />
                    </div>
                )}
                <div className={`w-full ${isFilterOpen ? 'md:w-3/4' : 'md:w-full'}`}>
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
                        </div>
                    ) : noProductsFound ? (
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
