import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { IProduct } from "@/lib/backend/models/interfaces/product.interface";
import { Plus } from "lucide-react";
import { useState } from "react";

interface AddProductDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  handleAddProduct: (product: Partial<IProduct>) => void;
}

const AddProductDialog: React.FC<AddProductDialogProps> = ({
  isOpen,
  setIsOpen,
  handleAddProduct,
}) => {
  const [newProduct, setNewProduct] = useState<Partial<IProduct>>({
    name: "",
    price: 0,
    images: [""],
    description: "",
    url: "",
  });

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...(newProduct.images || [])];
    newImages[index] = value;
    setNewProduct({ ...newProduct, images: newImages });
  };

  const addImageField = () => {
    setNewProduct({ ...newProduct, images: [...(newProduct.images || []), ""] });
  };

  const removeImageField = (index: number) => {
    const newImages = (newProduct.images || []).filter((_, i) => i !== index);
    setNewProduct({ ...newProduct, images: newImages });
  };

  const onAddProduct = async () => {
    const filteredProduct = {
      ...newProduct,
      images: (newProduct.images || []).filter(url => url.trim() !== "")
    };
    await handleAddProduct(filteredProduct);
    
    setNewProduct({ name: "", price: 0, images: [""], description: "", url: "" });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Añadir Producto
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Añadir Nuevo Producto</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nombre
            </Label>
            <Input
              id="name"
              value={newProduct.name}
              onChange={(e) =>
                setNewProduct({ ...newProduct, name: e.target.value })
              }
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right">
              Precio
            </Label>
            <Input
              id="price"
              type="number"
              value={newProduct.price}
              onChange={(e) =>
                setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })
              }
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">URLs de Imágenes</Label>
            <div className="col-span-3 space-y-2">
              {(newProduct.images || []).map((image, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={image}
                    onChange={(e) => handleImageChange(index, e.target.value)}
                    placeholder={`URL de imagen ${index + 1}`}
                  />
                  {(newProduct.images || []).length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => removeImageField(index)}
                    >
                      X
                    </Button>
                  )}
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
            <Label htmlFor="url" className="text-right">
              URL del Producto
            </Label>
            <Input
              id="url"
              value={newProduct.url || ""}
              onChange={(e) =>
                setNewProduct({ ...newProduct, url: e.target.value })
              }
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Descripción
            </Label>
            <Textarea
              id="description"
              value={newProduct.description}
              onChange={(e) =>
                setNewProduct({ ...newProduct, description: e.target.value })
              }
              className="col-span-3"
            />
          </div>
        </div>
        <Button onClick={onAddProduct}>Añadir Producto</Button>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductDialog;
