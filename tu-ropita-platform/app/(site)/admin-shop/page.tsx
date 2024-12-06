'use client'

import { privateBrandsApiWrapper } from "@/api-wrappers/brands";
import { privateMetricsApiWrapper } from "@/api-wrappers/metrics";
import toast from "@/components/toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IBrand } from "@/lib/backend/models/interfaces/brand.interface";
import { IMetrics } from "@/lib/backend/models/interfaces/metrics/metric.interface";
import { ProductInteractionEnum } from "@/lib/backend/models/interfaces/metrics/productInteraction.interface";
import { IProduct } from "@/lib/backend/models/interfaces/product.interface";
import { addDays } from "date-fns";
import Cookies from "js-cookie";
import { AlertTriangle, Loader2, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export default function ShopAdminPage() {
  const [brand, setBrand] = useState<IBrand | null>(null);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [metrics, setMetrics] = useState<IMetrics[]>([]);
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

  const fetchBrandMetrics = useCallback(async (brandId: string) => {
    const from = addDays(new Date(), -30);
    const to = new Date();
    privateMetricsApiWrapper.getBrandMetrics(authToken!, from, to, brandId)
        .then(d => setMetrics(d));
  }, []);

  useEffect(() => {
    async function loadData() {
      const brandData = await fetchBrandDetails();
      if (brandData) {
        await fetchProducts(brandData.id.toString());
        await fetchBrandMetrics(brandData.id.toString());
      }
    }
    loadData();
  }, [fetchBrandDetails, fetchProducts, fetchBrandMetrics]);

  if (!brand) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  const handleRefresh = async () => {
    try {
      await privateMetricsApiWrapper.syncMetricsAggDaily(authToken!);
      toast({ type: 'success', message: "Metricas sincronizadas correctamente." });
      window.location.reload();
    } catch (error) {
      console.error("Error syncing metrics:", error);
      toast({
        type: 'error',
        message: "Ocurrio un error al sincronizar las metricas. Intentelo de nuevo "
      });
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-row justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard de <span className="italic font-semibold">{brand?.name}</span></h1>
        <div className="flex items-center gap-2 text-gray-600">
          <p>Última actualización: {new Date().toLocaleString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          })}</p>
          <button 
            onClick={handleRefresh}
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
            title="Recargar página"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-auto">
        <Card className={brand?.status === 'ACTIVE' ? 'bg-green-50 h-fit' : 'bg-red-50 h-fit'}>
          <CardHeader>
            <CardTitle>Estado de la tienda</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                brand?.status === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span className="font-medium">{brand?.status === 'ACTIVE' ? 'Activa' : 'Pausada'}</span>
            </div>
            {brand?.status !== 'ACTIVE' && (
              <div className="mt-4 p-4 bg-white rounded-md text-red-600 text-sm">
                <p className="flex items-center">
                  <AlertTriangle className="mr-2" />
                  Tu tienda fue pausada por un administrador, ponte en contacto con nosotros para saber la razón y reactivarla.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Clicks totales</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-700">
              {metrics
                  .filter((m) => m.interaction === ProductInteractionEnum.CLICK)
                  .reduce((sum, m) => sum + m.count, 0)
                  .toString()}
            </p>

            <p className="text-sm text-gray-500 mt-2">Últimos 30 días</p>
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Productos activos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-700">{products.filter(product => product.status === 'ACTIVE').length}</p>
            <p className="text-sm text-gray-500 mt-2">En catálogo</p>
          </CardContent>
        </Card>

        <Card className="bg-amber-50 border-amber-200 h-fit">
          <CardHeader>
            <CardTitle className="text-amber-800">Productos pausados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-amber-500" />
              <p className="text-3xl font-bold text-amber-700">{products.filter(product => product.status !== 'ACTIVE').length}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
