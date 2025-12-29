'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { publicProductsApiWrapper } from '@/api-wrappers/products';
import { IProduct } from '@/lib/backend/models/interfaces/product.interface';
import ProductCard from '@/components/ProductCard';
import { Loader2 } from 'lucide-react';

interface InfiniteSearchResultsProps {
    initialProducts: IProduct[];
    initialTotalPages: number;
    searchParams: {
        search?: string;
        categoryId?: string;
        skipAI?: boolean;
        [key: string]: string | boolean | undefined;
    };
}

const PAGE_SIZE = 50;

export default function InfiniteSearchResults({
    initialProducts,
    initialTotalPages,
    searchParams: initialSearchParams
}: InfiniteSearchResultsProps) {
    const searchParams = useSearchParams();
    const [products, setProducts] = useState<IProduct[]>(initialProducts);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(initialTotalPages);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(initialTotalPages > 1);

    const observerRef = useRef<IntersectionObserver | null>(null);
    const sentinelRef = useRef<HTMLDivElement | null>(null);

    // Create stable search params string for dependency tracking
    const searchParamsString = searchParams.toString();

    // Reset when search params change
    useEffect(() => {
        setProducts(initialProducts);
        setCurrentPage(1);
        setTotalPages(initialTotalPages);
        setHasMore(initialTotalPages > 1);
        setIsLoading(false);
        window.scrollTo(0, 0);
    }, [searchParamsString, initialProducts, initialTotalPages]);

    // Load more products
    const loadMoreProducts = useCallback(async () => {
        if (isLoading || !hasMore) return;

        setIsLoading(true);
        try {
            const query = initialSearchParams.search || '';
            const categoryId = initialSearchParams.categoryId ? parseInt(initialSearchParams.categoryId, 10) : null;

            // Build filters object including all params (for attribute filters)
            const filters: any = { skipAI: initialSearchParams.skipAI };
            if (categoryId) {
                filters.categoryId = categoryId;
            }

            // Add all other params (attribute filters)
            Object.entries(initialSearchParams).forEach(([key, value]) => {
                if (key !== 'search' && key !== 'categoryId' && key !== 'skipAI' && value !== undefined) {
                    filters[key] = value;
                }
            });

            const nextPage = currentPage + 1;
            const result = await publicProductsApiWrapper.getFilteredProducts(
                query,
                filters,
                nextPage,
                PAGE_SIZE
            );

            if (result && result.products.length > 0) {
                // Filter out inactive products
                const filteredProducts = result.products.filter(
                    p => p.status !== 'DELETED' &&
                         p.status !== 'PAUSED' &&
                         p.status !== 'PAUSED_BY_ADMIN'
                );

                // Prevent duplicates
                setProducts(prev => {
                    const existingIds = new Set(prev.map(p => p.id));
                    const newProducts = filteredProducts.filter(p => !existingIds.has(p.id));
                    return [...prev, ...newProducts];
                });

                setCurrentPage(nextPage);
                setTotalPages(result.totalPages);
                setHasMore(nextPage < result.totalPages);
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error('Error loading more products:', error);
            // Keep hasMore true so user can retry
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, hasMore, currentPage, initialSearchParams]);

    // Setup IntersectionObserver
    useEffect(() => {
        if (!sentinelRef.current || !hasMore || isLoading) return;

        observerRef.current = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    loadMoreProducts();
                }
            },
            {
                threshold: 0.1,
                rootMargin: '100px'
            }
        );

        observerRef.current.observe(sentinelRef.current);

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [hasMore, isLoading, currentPage, loadMoreProducts]);

    if (products.length === 0) {
        return null;
    }

    return (
        <>
            <h1 className="text-xl mb-6">Resultados de búsqueda:</h1>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>

            {/* Sentinel element for IntersectionObserver */}
            <div ref={sentinelRef} className="h-10" aria-hidden="true" />

            {/* Loading indicator */}
            {isLoading && (
                <div className="flex justify-center items-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <span className="ml-2">Cargando más productos...</span>
                </div>
            )}

            {/* End of results message */}
            {!hasMore && products.length > 0 && !isLoading && (
                <div className="text-center py-8 text-gray-600">
                    <p>Has visto todos los productos disponibles</p>
                </div>
            )}
        </>
    );
}
