"use client";

import ProductCard from "@/components/ProductCard"; // Add this import
import { SearchBar } from "@/components/SearchBar";
import SearchFilters from "@/components/SearchFilters";
import SearchResults from "@/components/SearchResults";
import { IProduct } from "@/lib/backend/models/interfaces/product.interface";
import globalSettings from "@/lib/settings";
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from "react";

async function getProducts(query: string, filters: any): Promise<IProduct[]> {
    const queryParams = new URLSearchParams({ search: query, ...filters });
    const res = await fetch(`${globalSettings.BASE_URL}/api/products?${queryParams}`, { cache: 'no-store' });
    if (!res.ok) {
        throw new Error('Failed to fetch products');
    }
    return res.json();
}

export default function SearchPage() {
    const [recommendedProducts, setRecommendedProducts] = useState<IProduct[]>([]);
    const [filters, setFilters] = useState({});
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const searchParams = useSearchParams();

    useEffect(() => {
        const fetchProducts = async () => {
            const query = searchParams.get('q') || '';
            const products = await getProducts(query, filters);
            setRecommendedProducts(products.slice(0, 4));
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
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2 sm:gap-0">
                        <h2 className="text-2xl sm:text-3xl mt-4 sm:mt-0">Nosotros recomendamos</h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        {recommendedProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                    <SearchResults products={recommendedProducts} />
                </div>
            </div>
        </>
    );
}
