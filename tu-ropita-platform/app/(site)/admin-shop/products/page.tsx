"use client"

import { privateBrandsApiWrapper } from "@/api-wrappers/brands";
import { privateProductsApiWrapper } from "@/api-wrappers/products";
import { privatePromotionsApiWrapper } from "@/api-wrappers/promotions";
import toast from "@/components/toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { IBrand } from "@/lib/backend/models/interfaces/brand.interface";
import { IPromotion } from "@/lib/backend/models/interfaces/IPromotion";
import { IProduct } from "@/lib/backend/models/interfaces/product.interface";
import Cookies from "js-cookie";
import {
  Download,
  FileDown,
  Loader2,
  Upload
} from "lucide-react";
import { Suspense, useCallback, useEffect, useRef, useState, useMemo } from "react";
import AddProductDialog from "./AddProductDialog";
import ProductTable from "./ProductsTable";
import DownloadProductsTagsButton from "./DownloadProductsTagsButton";

export default function ShopAdminProductsPage() {
  const [brand, setBrand] = useState<IBrand | null>(null);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [promotions, setPromotions] = useState<IPromotion[]>([]);
  const [newProduct, setNewProduct] = useState<Partial<IProduct>>({
    name: "",
    price: 0,
    images: [],
    description: "",
  });
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Estabilizar authToken para prevenir re-renders innecesarios
  const authToken = useMemo(() => Cookies.get("Authorization"), []);

  const fetchBrandDetails = useCallback(async () => {
    if (!authToken) return null;
    const brandData = await privateBrandsApiWrapper.getMyBrand(authToken);
    setBrand(brandData);
    return brandData;
  }, [authToken]);

  const fetchProducts = useCallback(
    async (brandId: string) => {
      if (!authToken) return;
      const productsData =
        await privateBrandsApiWrapper.getBrandProductsAsPrivilegedUser(
          authToken,
          brandId
        );
      if (productsData) {
        setProducts(productsData.products);
      }
    },
    [authToken]
  );

  const fetchPromotions = useCallback(async (brandId: string) => {
    if (!authToken) return;
    const promotions = await privateBrandsApiWrapper.getBrandPromotions(authToken, brandId);
    if(promotions){
      setPromotions(promotions);
    }
  }, [authToken]);

  useEffect(() => {
    async function loadData() {
      const brandData = await fetchBrandDetails();
      if (brandData) {
        await fetchProducts(brandData.id.toString());
        await fetchPromotions(brandData.id.toString());
      }
    }
    loadData();
  }, [fetchBrandDetails, fetchProducts, fetchPromotions]);

  if (!brand) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const handleAddProduct = async (productData: Partial<IProduct>) => {
    if (!brand) {
      toast({
        type: "error",
        message: "No se encontró la información de la marca.",
      });
      return;
    }

    if (!authToken) {
      toast({
        type: "error",
        message: "No se encontró token de autenticación.",
      });
      return;
    }

    try {
      const createdProduct = await privateProductsApiWrapper.createProduct(
        authToken,
        brand.id.toString(),
        {
          name: productData.name || "",
          price: productData.price || 0,
          description: productData.description || "",
          images: productData.images || [],
          url: productData.url || "",
        }
      );

      if (createdProduct) {
        setProducts(prevProducts => [...prevProducts, createdProduct]);
        toast({ type: "success", message: "Producto añadido correctamente." });
        setNewProduct({ name: "", price: 0, images: [], description: "" });
        setIsAddProductOpen(false);
      } else {
        toast({
          type: "error",
          message: "Error al añadir el producto. Intente nuevamente.",
        });
      }
    } catch (error) {
      toast({
        type: "error",
        message: "Ocurrió un error al añadir el producto.",
      });
    }
  };

  const handleProductUpdate = (updatedProduct: IProduct) => {
    setProducts(prevProducts => 
      prevProducts.map(p => p.id === updatedProduct.id ? updatedProduct : p)
    );
  };

  const handleProductDelete = (deletedProductId: string) => {
    setProducts(prevProducts => 
      prevProducts.filter(p => p.id.toString() !== deletedProductId)
    );
  };

  const handleExport = () => {
    const csvHeader = "name,price,description,images,url\n";
    const csvRows = products
      .map(
        (product) =>
          `"${product.name}",${product.price},"${product.description}","${product.images.join(
            ";"
          )}","${product.url || ""}"`
      )
      .join("\n");

    const csvContent = csvHeader + csvRows;
    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `FINDCLO_${brand.name}_productos_exportados.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !brand) {
      toast({
        type: "error",
        message: "No se seleccionó ningún archivo o no se encontró la marca.",
      });
      return;
    }

    if (!authToken) {
      toast({
        type: "error",
        message: "No se encontró token de autenticación.",
      });
      return;
    }

    try {
      const result =
        await privateProductsApiWrapper.uploadProductsFromCSV(
          authToken,
          brand.id.toString(),
          file
        );
      if (result) {
        toast({
          type: "success",
          message: "Los productos se importaron correctamente.",
        });
        await fetchProducts(brand.id.toString());
      } else {
        toast({
          type: "error",
          message: "Hubo un problema al importar los productos.",
        });
      }
    } catch (error) {
      toast({
        type: "error",
        message: "Ocurrió un error al importar los productos.",
      });
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleDownloadTemplate = () => {
    const templateContent = `data:text/csv;charset=utf-8,name,price,description,images,url
Chaqueta Vaquera Clásica,79.99,"Chaqueta vaquera azul versátil con cierre de botones y múltiples bolsillos","https://images.unsplash.com/photo-1543076447-215ad9ba6923?w=800; https://images.unsplash.com/photo-1578681994506-b8f463449011?w=800",https://example.com/products/denim-jacket
`;
    const encodedUri = encodeURI(templateContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      "FINDCLO_plantilla_importacion_productos.csv"
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleProductPromotion = async (productId: number, credits_allocated: number, show_on_landing: boolean, keywords?: string[]) => {
    if (!authToken) {
      toast({
        type: "error",
        message: "No se encontró token de autenticación.",
      });
      return;
    }
    
    try{
      const promotion = await privatePromotionsApiWrapper.createPromotion(authToken, {
        product_id: productId,
        credits_allocated: credits_allocated,
        show_on_landing: show_on_landing,
        keywords: keywords || []
      });
      
      if(promotion){
        toast({
          type: "success",
          message: "Promoción creada correctamente.",
        });
        fetchPromotions(brand.id.toString());
      } else {
        toast({
          type: "error",
          message: "Error al crear la promoción.",
        });
      }
    }catch(error){
      toast({
        type: "error",
        message: "Ocurrió un error al crear la promoción. Vuelva a intentarlo mas tarde.",
      });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between mb-4">
        <AddProductDialog
          isOpen={isAddProductOpen}
          setIsOpen={setIsAddProductOpen}
          handleAddProduct={handleAddProduct}
        />
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleDownloadTemplate}>
            <Download className="mr-2 h-4 w-4" /> Descargar Plantilla
          </Button>
          <Button variant="outline" onClick={triggerFileInput}>
            <Upload className="mr-2 h-4 w-4" /> Importar
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleImport}
            style={{ display: "none" }}
          />
        </div>
      </div>
      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-bold">Productos</CardTitle>
        </CardHeader>
        <Suspense fallback={<div>Cargando productos...</div>}>
          <ProductTable
            products={products}
            promotions={promotions}
            brandId={brand?.id.toString() ?? ""}
            onProductsUpdate={setProducts}
            onProductUpdate={handleProductUpdate}
            onProductDelete={handleProductDelete}
            onProductPromotion={handleProductPromotion}
          />
        </Suspense>
      </Card>
      <div className="flex justify-end mt-4 space-x-2">
        <Button variant="outline" onClick={handleExport}>
          <FileDown className="mr-2 h-4 w-4" /> Exportar
        </Button>
        {authToken && <DownloadProductsTagsButton authToken={authToken} brandId={brand.id} />}
      </div>
    </div>
  );
}
