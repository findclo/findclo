import { privateBrandsApiWrapper } from "@/api-wrappers/brands";
import { privateProductsApiWrapper } from "@/api-wrappers/products";
import toast from "@/components/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IBrandCredits } from "@/lib/backend/models/interfaces/IBrandCredits";
import { IPromotion } from "@/lib/backend/models/interfaces/IPromotion";
import { IProduct } from "@/lib/backend/models/interfaces/product.interface";
import Cookies from "js-cookie";
import { ArrowBigDownDash, ArrowBigUpDash, Edit, Trash2 } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import EditProductDialog from "./EditProductDialog";
import PromoteProductDialog from "./PromoteProductDialog";

interface ProductTableProps {
  products: IProduct[];
  promotions: IPromotion[];
  brandId: string;
  onProductsUpdate: (updatedProducts: IProduct[]) => void;
  onProductUpdate: (updatedProduct: IProduct) => void;
  onProductDelete: (deletedProductId: string) => void;
  onProductPromotion: (productId: number, credits_allocated: number, show_on_landing: boolean) => void;
}

const ProductTable: React.FC<ProductTableProps> = ({
  products,
  promotions,
  brandId,
  onProductsUpdate,
  onProductUpdate,
  onProductDelete,
  onProductPromotion,
}) => {
  const [promotionsList, setPromotionsList] = useState<IPromotion[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPromotionDialogOpen, setIsPromotionDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);
  const [brandCredits, setBrandCredits] = useState<IBrandCredits | null>(null);
  const [search, setSearch] = useState("");
  const authToken = Cookies.get("Authorization")!;

  useEffect(() => {
    setPromotionsList(promotions);
  }, [promotions]);

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleStatusChange = async (
    productId: string,
    newStatus: "ACTIVE" | "PAUSED"
  ) => {
    try {
      const product = products.find((p) => p.id.toString() === productId);
      if (product?.status === "PAUSED_BY_ADMIN") {
        toast({
          type: "error",
          message: "Este producto ha sido pausado por un administrador y no puede ser modificado.",
        });
        return;
      }

      const updatedProduct = await privateProductsApiWrapper.changeProductStatus(
        authToken,
        productId,
        newStatus
      );
      
      if (updatedProduct) {
        onProductUpdate(updatedProduct);
        toast({
          type: "success",
          message: `Estado del producto actualizado correctamente.`,
        });
      }
    } catch (error) {
      console.error("Error updating product status:", error);
      toast({
        type: "error",
        message: "Ocurrió un error al actualizar el estado del producto.",
      });
    }
  };

  const handleDeleteProduct = async (id: string) => {
    const isConfirmed = window.confirm(
      `¿Estás seguro de que quieres eliminar el producto "${
        products.find((p) => p.id.toString() === id)?.name
      }" de tu tienda?`
    );

    if (isConfirmed) {
      try {
        await privateProductsApiWrapper.deleteProduct(authToken, id);
        onProductDelete(id);
        toast({ type: "success", message: "Producto eliminado correctamente." });
      } catch (error) {
        toast({
          type: "error",
          message: "Error al eliminar el producto. Intente nuevamente.",
        });
      }
    }
  };

  const handleUpdateProduct = async (updatedProduct: IProduct) => {
    try {
      const result = await privateProductsApiWrapper.updateProduct(
        authToken,
        updatedProduct.id.toString(),
        {
          name: updatedProduct.name,
          price: updatedProduct.price,
          description: updatedProduct.description,
          images: updatedProduct.images,
          url: updatedProduct.url,
        }
      );

      if (result) {
        onProductUpdate(result);
        setSelectedProduct(null);
        setIsEditDialogOpen(false);
        toast({
          type: "success",
          message: "Producto actualizado correctamente.",
        });
      }
    } catch (error) {
      toast({
        type: "error",
        message: "Ocurrió un error al actualizar el producto.",
      });
    }
  };

  const openEditDialog = (product: IProduct) => {
    setSelectedProduct(product);
    setIsEditDialogOpen(true);
  };

  const openPromotionDialog = (product: IProduct) => {
    setSelectedProduct(product);
    setIsPromotionDialogOpen(true);
  };

  useEffect(() => {
    const fetchCredits = async () => {
        if (brandId) {
            const credits = await privateBrandsApiWrapper.getBrandCredits(
                authToken,
                brandId
            );
            if (credits) {
                setBrandCredits(credits);
            }
        }
    };
    fetchCredits();
}, [brandId]);

const handleStopPromotion = async (promotionId: string) => {
  try {
    if(confirm("¿Estás seguro de que quieres detener la promoción?")){
      const result = await privateBrandsApiWrapper.stopPromotion(authToken, brandId, parseInt(promotionId));
      if(!result){
        throw new Error("Error al detener la promoción.");
      }
      toast({
        type: "success",
        message: "Promoción detenida correctamente.",
      });
      setPromotionsList(promotionsList.filter(promotion => promotion.id !== parseInt(promotionId)));
    }
  } catch (error) {
    console.error("Error stopping promotion:", error);
    toast({
      type: "error",
      message: "Error al detener la promoción. Intente nuevamente.",
    });
  }
};

  return (
    <>
      <div className="ml-4 mb-4">
        <Input
          placeholder="Buscar productos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <ScrollArea className="h-[400px] overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="sticky top-0 bg-background">
                Imagen
              </TableHead>
              <TableHead className="sticky top-0 bg-background">
                Nombre
              </TableHead>
              <TableHead className="sticky top-0 bg-background">
                Precio
              </TableHead>
              <TableHead className="sticky top-0 bg-background">
                Descripción
              </TableHead>
              <TableHead className="sticky top-0 bg-background">
                URL
              </TableHead>
              <TableHead className="sticky top-0 bg-background">
                Estado
              </TableHead>
              <TableHead className="sticky top-0 bg-background">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length > 0 ? (
              filteredProducts.filter(product => product.status !== 'DELETED').map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <Image
                      src={product.images[0] || "/placeholder.svg"}
                      alt={product.name}
                      width={40}
                      height={40}
                      className="rounded"
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    {product.name}
                  </TableCell>
                  <TableCell>${product.price.toFixed(2)}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {product.description}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    <a
                      href={product.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      {product.url}
                    </a>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={product.status === "ACTIVE"}
                        onCheckedChange={(checked) =>
                          handleStatusChange(
                            product.id.toString(),
                            checked ? "ACTIVE" : "PAUSED"
                          )
                        }
                        disabled={product.status === "PAUSED_BY_ADMIN"}
                      />
                      <span>
                        {product.status === "ACTIVE"
                          ? "Activo"
                          : product.status === "PAUSED_BY_ADMIN"
                          ? "Pausado por administrador"
                          : "Pausado"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {product.status === "ACTIVE" && !promotionsList.some(promotion => promotion.product_id === product.id && promotion.is_active) && <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openPromotionDialog(product)}
                      >
                        <ArrowBigUpDash className="h-4 w-4" />
                      </Button>}
                      {promotionsList.some(promotion => promotion.product_id === product.id && promotion.is_active) && <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStopPromotion(promotionsList.find(promotion => (promotion.product_id === product.id && promotion.is_active))?.id.toString() || "")}
                      >
                        <ArrowBigDownDash className="h-4 w-4 text-orange-500" />
                      </Button>}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(product)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() =>
                          handleDeleteProduct(product.id.toString())
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>

                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  {search
                    ? "No se encontraron productos"
                    : "No hay productos disponibles."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </ScrollArea>
      {selectedProduct && (
        <EditProductDialog
          isOpen={isEditDialogOpen}
          setIsOpen={setIsEditDialogOpen}
          product={selectedProduct}
          handleUpdateProduct={handleUpdateProduct}
        />
      )}
      {selectedProduct && (
        <PromoteProductDialog
          isOpen={isPromotionDialogOpen}
          setIsOpen={setIsPromotionDialogOpen}
          product={selectedProduct}
          brandCredits={brandCredits}
          handleProductPromotion={onProductPromotion}
        />
      )}
    </>
  );
};

export default ProductTable;