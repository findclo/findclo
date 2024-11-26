import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { IProduct } from "@/lib/backend/models/interfaces/product.interface";
import React, { useEffect, useState } from "react";

interface EditProductDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  product: IProduct | null;
  handleUpdateProduct: (updatedProduct: IProduct) => void;
}

const EditProductDialog: React.FC<EditProductDialogProps> = ({
  isOpen,
  setIsOpen,
  product,
  handleUpdateProduct,
}) => {
  const [editingProduct, setEditingProduct] = useState<IProduct | null>(null);

  useEffect(() => {
    setEditingProduct(product);
    console.log("aca 1");
    console.log(product);
  }, [product]);

  const onUpdateProduct = () => {
    if (editingProduct) {
      handleUpdateProduct(editingProduct);
      setIsOpen(false);
    }
  };

  const handleImageChange = (index: number, value: string) => {
    setEditingProduct((prev) => {
      if (!prev) return null;
      const newImages = [...prev.images];
      newImages[index] = value;
      return { ...prev, images: newImages };
    });
  };

  const addImageField = () => {
    setEditingProduct((prev) => {
      if (!prev) return null;
      return { ...prev, images: [...prev.images, ""] };
    });
  };

  const removeImageField = (index: number) => {
    setEditingProduct((prev) => {
      if (!prev) return null;
      const newImages = prev.images.filter((_, i) => i !== index);
      return { ...prev, images: newImages };
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Producto</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-name" className="text-right">
              Nombre
            </Label>
            <Input
              id="edit-name"
              value={editingProduct?.name || ""}
              onChange={(e) =>
                setEditingProduct((prev) =>
                  prev ? { ...prev, name: e.target.value } : null
                )
              }
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-price" className="text-right">
              Precio
            </Label>
            <Input
              id="edit-price"
              type="number"
              value={editingProduct?.price || 0}
              onChange={(e) =>
                setEditingProduct((prev) =>
                  prev
                    ? { ...prev, price: parseFloat(e.target.value) }
                    : null
                )
              }
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">URLs de Imágenes</Label>
            <div className="col-span-3 space-y-2">
              {editingProduct?.images.map((image, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={image}
                    onChange={(e) => handleImageChange(index, e.target.value)}
                    placeholder={`URL de imagen ${index + 1}`}
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => removeImageField(index)}
                  >
                    X
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addImageField}
                className="w-full"
              >
                Agregar imagen
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-url" className="text-right">
              URL del Producto
            </Label>
            <Input
              id="edit-url"
              value={editingProduct?.url || ""}
              onChange={(e) =>
                setEditingProduct((prev) =>
                  prev ? { ...prev, url: e.target.value } : null
                )
              }
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-description" className="text-right">
              Descripción
            </Label>
            <Textarea
              id="edit-description"
              value={editingProduct?.description || ""}
              onChange={(e) =>
                setEditingProduct((prev) =>
                  prev ? { ...prev, description: e.target.value } : null
                )
              }
              className="col-span-3"
            />
          </div>
        </div>
        <Button onClick={onUpdateProduct}>Actualizar Producto</Button>
      </DialogContent>
    </Dialog>
  );
};

export default EditProductDialog;
