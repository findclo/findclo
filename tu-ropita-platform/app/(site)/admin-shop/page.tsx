'use client'

import { privateBrandsApiWrapper } from "@/api-wrappers/brands";
import { IBrand } from "@/lib/backend/models/interfaces/brand.interface";
import { IProduct } from "@/lib/backend/models/interfaces/product.interface";
import Cookies from "js-cookie";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export default function ShopAdminPage() {
  const [brand, setBrand] = useState<IBrand | null>(null);
  const [products, setProducts] = useState<IProduct[]>([]);
  const authToken = Cookies.get('Authorization')!;

  const fetchBrandDetails = useCallback(async () => {
    const brandData = await privateBrandsApiWrapper.getMyBrand(authToken);
    setBrand(brandData);
    return brandData;
  }, []);

  const fetchProducts = useCallback(async (brandId: string) => {
    const productsData = await privateBrandsApiWrapper.getBrandProductsAsPrivilegedUser(authToken, brandId);
    if (productsData) {
      setProducts(productsData.products);
    }
  }, []);

  useEffect(() => {
    async function loadData() {
      const brandData = await fetchBrandDetails();
      if (brandData) {
        await fetchProducts(brandData.id.toString());
      }
    }
    loadData();
  }, [fetchBrandDetails, fetchProducts]);

  if (!brand) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard de <span className="italic font-semibold">{brand?.name}</span></h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className={`p-6 rounded-lg shadow-md ${
          brand?.status === 'ACTIVE' ? 'bg-green-50' : 'bg-red-50'
        }`}>
          <h2 className="text-xl font-semibold mb-3">Estado de la Tienda</h2>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              brand?.status === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <span className="font-medium">{brand?.status === 'ACTIVE' ? 'Activa' : 'Pausada'}</span>
          </div>
          {brand?.status !== 'ACTIVE' && (
            <div className="mt-4 p-4 bg-white rounded-md text-red-600 text-sm">
              <p className="flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Tu tienda fue pausada por un administrador, ponete en contacto con nosotros para saber la razón y reactivarla.
              </p>
            </div>
          )}
        </div>

        <div className="p-6 rounded-lg shadow-md bg-white">
          <h2 className="text-xl font-semibold mb-3">Clicks Totales</h2>
          <p className="text-3xl font-bold text-gray-700">0</p>
          <p className="text-sm text-gray-500 mt-2">Últimos 30 días</p>
        </div>

        <div className="p-6 rounded-lg shadow-md bg-white">
          <h2 className="text-xl font-semibold mb-3">Productos Activos</h2>
          <p className="text-3xl font-bold text-gray-700">{products.filter(product => product.status === 'ACTIVE').length}</p>
          <p className="text-sm text-gray-500 mt-2">En catálogo</p>
        </div>

        <div className="p-6 rounded-lg shadow-md bg-amber-50 border border-amber-200">
          <h2 className="text-xl font-semibold mb-3 text-amber-800">Productos Pausados</h2>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-amber-500" />
            <p className="text-3xl font-bold text-amber-700">{products.filter(product => product.status !== 'ACTIVE').length}</p>
          </div>
        </div>
      </div>

    </div>
  );
}
