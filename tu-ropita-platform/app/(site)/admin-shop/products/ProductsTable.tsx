import { privateBrandsApiWrapper } from "@/api-wrappers/brands";
import { privateProductsApiWrapper } from "@/api-wrappers/products";
import { privateAttributesApiWrapper } from "@/api-wrappers/attributes";
import toast from "@/components/toast";
import { IProductAttributeAssignment } from "@/lib/backend/dtos/attribute.dto.interface";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { IBrandCredits } from "@/lib/backend/models/interfaces/IBrandCredits";
import { IPromotion } from "@/lib/backend/models/interfaces/IPromotion";
import { IProduct } from "@/lib/backend/models/interfaces/product.interface";
import Cookies from "js-cookie";
import { ArrowBigDownDash, ArrowBigUpDash, Edit, ExternalLink, Info, Trash2, X } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import UpsertProductStepper from "./UpsertProductStepper";
import ProductPromotionDetailsDialog from "./ProductPromotionDetailsDialog";
import PromoteProductDialog from "./PromoteProductDialog";
import { formatPrice } from "@/lib/utils";

interface ProductTableProps {
  products: IProduct[];
  promotions: IPromotion[];
  brandId: string;
  onProductsUpdate: (updatedProducts: IProduct[]) => void;
  onProductUpdate: (updatedProduct: IProduct) => void;
  onProductDelete: (deletedProductId: string) => void;
  onProductPromotion: (productId: number, credits_allocated: number, show_on_landing: boolean, keywords?: string[]) => void;
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
  const [isPromotionDetailsDialogOpen, setIsPromotionDetailsDialogOpen] = useState(false);
  const [selectedPromotionId, setSelectedPromotionId] = useState<number | null>(null);

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

  const handleUpdateProduct = async (
    productData: Omit<Partial<IProduct>, 'attributes'>,
    category_ids?: number[],
    attributes?: IProductAttributeAssignment[]
  ) => {
    if (!selectedProduct) return;

    try {
      // Update product with all information in a single call
      const result = await privateProductsApiWrapper.updateProduct(
        authToken,
        selectedProduct.id.toString(),
        {
          name: productData.name || "",
          price: productData.price || 0,
          description: productData.description || "",
          images: productData.images || [],
          url: productData.url || "",
          category_ids: category_ids || [],
          attributes: attributes // Pass attributes directly to updateProduct
        }
      );

      if (result) {
        onProductUpdate(result);
        setSelectedProduct(null);
        setIsEditDialogOpen(false);

        const categoryMessage = category_ids && category_ids.length > 0
          ? ` con ${category_ids.length} categoría(s)`
          : "";
        const attributesMessage = attributes && attributes.length > 0
          ? ` y ${attributes.length} atributo(s)`
          : "";

        toast({
          type: "success",
          message: `Producto actualizado correctamente${categoryMessage}${attributesMessage}.`,
        });
      }
    } catch (error) {
      console.error("Error updating product:", error);
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
}, [brandId, authToken]);

const handleStopPromotion = async (promotionId: string) => {
  try {
    if(confirm("¿Estás seguro de que quieres detener la promoción?")){
      const result = await privateBrandsApiWrapper.stopPromotion(authToken, brandId, parseInt(promotionId));
      console.log(result);
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

const openPromotionDetails = (promotionId: number) => {
  setSelectedPromotionId(promotionId);
  setIsPromotionDetailsDialogOpen(true);
};

  return (
    <>
      <div className="ml-4 mb-4 flex gap-2">
        <div className="relative max-w-sm">
          <Input
            placeholder="Buscar productos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-8"
          />
          {search && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
              onClick={() => setSearch("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
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
                Categorías
              </TableHead>
              <TableHead className="sticky top-0 bg-background">
                Atributos
              </TableHead>
              <TableHead className="sticky top-0 bg-background">
                Enlace
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
                  <TableCell>$ {formatPrice(product.price || 0)}</TableCell>
                  <TableCell>
                    {/* Categorías */}
                    <div className="flex flex-wrap gap-1">
                      {product.categories && product.categories.length > 0 ? (
                        <>
                          {product.categories.slice(0, 2).map((category) => (
                            <Badge key={category.id} variant="default" className="text-xs">
                              {category.name}
                            </Badge>
                          ))}
                          {product.categories.length > 2 && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Badge variant="outline" className="text-xs cursor-help">
                                    +{product.categories.length - 2} más
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <div className="flex flex-col gap-1">
                                    {product.categories.slice(2).map((category) => (
                                      <span key={category.id}>{category.name}</span>
                                    ))}
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </>
                      ) : (
                        <span className="text-xs text-muted-foreground">Sin categorías</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {/* Atributos */}
                    <div className="flex flex-wrap gap-1">
                      {product.attributes && product.attributes.length > 0 ? (
                        <>
                          {/* Group attributes by attribute_name */}
                          {(() => {
                            const groupedAttrs = product.attributes.reduce((acc, attr) => {
                              if (!acc[attr.attribute_name]) {
                                acc[attr.attribute_name] = [];
                              }
                              acc[attr.attribute_name].push(attr.value);
                              return acc;
                            }, {} as Record<string, string[]>);

                            const entries = Object.entries(groupedAttrs);
                            const displayedEntries = entries.slice(0, 2);

                            return (
                              <>
                                {displayedEntries.map(([attrName, values]) => (
                                  <Badge key={attrName} variant="secondary" className="text-xs">
                                    {attrName}: {values.join(", ")}
                                  </Badge>
                                ))}
                                {entries.length > 2 && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Badge variant="outline" className="text-xs cursor-help">
                                          +{entries.length - 2} más
                                        </Badge>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <div className="flex flex-col gap-1">
                                          {entries.slice(2).map(([attrName, values]) => (
                                            <span key={attrName}>{attrName}: {values.join(", ")}</span>
                                          ))}
                                        </div>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                              </>
                            );
                          })()}
                        </>
                      ) : (
                        <span className="text-xs text-muted-foreground">Sin atributos</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(product.url, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
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
                    <div className="flex space-x-2 justify-end">
                      {product.status === "ACTIVE" && !promotionsList.some(promotion => promotion.product_id === product.id && promotion.is_active) && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openPromotionDialog(product)}
                              >
                                <ArrowBigUpDash className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Promocionar producto</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      {promotionsList.some(promotion => promotion.product_id === product.id && promotion.is_active) && (
                        <>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleStopPromotion(promotionsList.find(promotion => (promotion.product_id === product.id && promotion.is_active))?.id.toString() || "")}
                                >
                                  <ArrowBigDownDash className="h-4 w-4 text-orange-500" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Detener promoción</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="relative">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openPromotionDetails(promotionsList.find(promotion => (promotion.product_id === product.id && promotion.is_active))?.id || 0)}
                                  >
                                    <Info className="h-4 w-4" />
                                  </Button>
                                  {promotionsList.find(promotion => 
                                    promotion.product_id === product.id && 
                                    promotion.is_active && 
                                    (promotion.credits_allocated - promotion.credits_spent <= 0)
                                  ) && (
                                    <div className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full" />
                                  )}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Ver detalles de promoción</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </>
                      )}

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(product)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Editar producto</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteProduct(product.id.toString())}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Eliminar producto</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  {search
                    ? "No se encontraron productos"
                    : "No hay productos disponibles."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </ScrollArea>
      <UpsertProductStepper
        isOpen={isEditDialogOpen}
        setIsOpen={setIsEditDialogOpen}
        product={selectedProduct}
        handleSubmit={handleUpdateProduct}
      />
      {selectedProduct && (
        <PromoteProductDialog
          isOpen={isPromotionDialogOpen}
          setIsOpen={setIsPromotionDialogOpen}
          product={selectedProduct}
          brandCredits={brandCredits}
          handleProductPromotion={async (productId, credits, showOnLanding, keywords) => {
            await onProductPromotion(productId, credits, showOnLanding, keywords);
            // Re-fetch brand credits after promotion
            const updatedCredits = await privateBrandsApiWrapper.getBrandCredits(
              authToken,
              brandId
            );
            if (updatedCredits) {
              setBrandCredits(updatedCredits);
            }
          }}
        />
      )}
      <ProductPromotionDetailsDialog
        isOpen={isPromotionDetailsDialogOpen}
        setIsOpen={setIsPromotionDetailsDialogOpen}
        promotionId={selectedPromotionId || 0}
        brandId={brandId}
        handleStopPromotion={handleStopPromotion}
      />
    </>
  );
};

export default ProductTable;