"use client"

import { publicBrandsApiWrapper } from '@/api-wrappers/brands';
import { publicProductsApiWrapper } from '@/api-wrappers/products';
import { Button } from "@/components/ui/button";
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ProductsSection from './ProductsSection';
import { useState, useEffect } from 'react';
import { IBrand } from '@/lib/backend/models/interfaces/brand.interface';
import { IProduct } from '@/lib/backend/models/interfaces/product.interface';
import { Loader2 } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

function BrandPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [brand, setBrand] = useState<IBrand | null>(null);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 50;

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const brandData = await publicBrandsApiWrapper.getBrandById(params.id);
        if (!brandData || brandData.status === 'PAUSED') {
          router.push('/404');
          return;
        }
        setBrand(brandData);

        const productsData = await publicProductsApiWrapper.getProductsByBrandId(params.id, currentPage, pageSize);
        if (productsData) {
          setProducts(productsData.products);
          setTotalPages(productsData.totalPages);
        }
      } catch (error) {
        router.push('/404');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [params.id, currentPage, router, pageSize]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!brand) {
    return <div>Nada que ver por aquí...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-center mb-8">
        <div className="flex items-center">
          <div className="w-48 h-48 flex-shrink-0 mr-8">
            <Image
              src={brand.image}
              alt={brand.name}
              width={192}
              height={192}
              className="rounded-full object-cover w-full h-full"
            />
          </div>
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold mb-4">{brand.name}</h1>
            <Button asChild>
              <Link
                href={brand.websiteUrl || ""}
                target="_blank"
                rel="noopener noreferrer"
              >
                Página de la marca
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {brand.description && (
        <>
          <h2 className="text-2xl font-semibold mb-4">Descripción de la marca</h2>
          <p className="text-gray-600 mb-8">{brand.description}</p>
        </>
      )}

      {products.length > 0 ? (
        <>
          <ProductsSection products={products} />
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) handlePageChange(currentPage - 1);
                      }}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(page);
                        }}
                        isActive={currentPage === page}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages) handlePageChange(currentPage + 1);
                      }}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      ) : (
        <div>Nada que ver por aquí...</div>
      )}
    </div>
  );
}

export default BrandPage;
