"use client";

import { SearchBar } from "@/components/SearchBar"; // Add this import
import SearchFilters from "@/components/SearchFilters";
import SearchResults from "@/components/SearchResults";
import { IProduct } from "@/lib/backend/models/interfaces/product.interface";
import globalSettings from "@/lib/settings";
import Image from "next/image";
import Link from "next/link";
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

    useEffect(() => {
        // Fetch products whenever the filters change
        const fetchProducts = async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const query = urlParams.get('q') || '';
            const products = await getProducts(query, filters);
            setRecommendedProducts(products.slice(0, 4));
        };

        fetchProducts();
    }, [filters]); // Remove query from dependency array

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
                        <h2 className="text-2xl sm:text-3xl mt-4 sm:mt-0">🚀 Recomendados</h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        {recommendedProducts.map((product) => (
                            <Link href={`/product/${product.id}`} key={product.id} className="group">
                                <div className={`border rounded-lg overflow-hidden transition-all duration-300 group-hover:shadow-lg`}>
                                    <Image
                                        src={product.images[0]}
                                        alt={product.name}
                                        width={300}
                                        height={300}
                                        className="w-full h-48 object-cover"
                                    />
                                    <div className="p-4">
                                        <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                                        <p className="text-gray-600">${product.price.toFixed(2)}</p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                    <SearchResults products={recommendedProducts} />
                </div>
            </div>
        </>
    );
}
