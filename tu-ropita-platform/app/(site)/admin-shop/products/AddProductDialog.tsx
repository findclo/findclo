"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { IProduct } from "@/lib/backend/models/interfaces/product.interface";
import { Plus, ChevronRight, ChevronLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { CategorySelector } from "./CategorySelector";
import { StepIndicator } from "./StepIndicator";
import { AttributeSelector } from "./AttributeSelector";
import toast from "@/components/toast";
import { IProductAttributeAssignment } from "@/lib/backend/dtos/attribute.dto.interface";

interface AddProductDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  handleAddProduct: (product: Omit<Partial<IProduct>, 'attributes'> & {
    category_ids?: number[];
    attributes?: IProductAttributeAssignment[];
  }) => void;
}

const AddProductDialog: React.FC<AddProductDialogProps> = ({
  isOpen,
  setIsOpen,
  handleAddProduct,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [newProduct, setNewProduct] = useState<Partial<IProduct>>({
    name: "",
    price: 0,
    images: [""],
    description: "",
    url: "",
  });
  const [selectedCategories, setSelectedCategories] = useState<Set<number>>(new Set());
  const [selectedAttributes, setSelectedAttributes] = useState<Map<number, Set<number>>>(new Map());

  // Reset step when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(1);
    }
  }, [isOpen]);

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

  // Validation for step 1
  const validateStep1 = (): boolean => {
    if (!newProduct.name || newProduct.name.trim() === "") {
      toast({ type: "error", message: "El nombre del producto es obligatorio." });
      return false;
    }
    if (!newProduct.price || newProduct.price <= 0) {
      toast({ type: "error", message: "El precio debe ser mayor a 0." });
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onAddProduct = async () => {
    // Convert selectedAttributes Map to IProductAttributeAssignment[]
    const attributes: IProductAttributeAssignment[] = Array.from(selectedAttributes.entries()).map(
      ([attribute_id, value_ids]) => ({
        attribute_id,
        value_ids: Array.from(value_ids)
      })
    );

    const filteredProduct = {
      ...newProduct,
      images: (newProduct.images || []).filter(url => url.trim() !== ""),
      category_ids: Array.from(selectedCategories),
      attributes: attributes.length > 0 ? attributes : undefined
    };
    await handleAddProduct(filteredProduct);

    // Reset form
    setNewProduct({ name: "", price: 0, images: [""], description: "", url: "" });
    setSelectedCategories(new Set());
    setSelectedAttributes(new Map());
    setCurrentStep(1);
    setIsOpen(false);
  };

  const renderStep1 = () => (
    <div className="grid gap-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="name" className="text-right">
          Nombre *
        </Label>
        <Input
          id="name"
          value={newProduct.name}
          onChange={(e) =>
            setNewProduct({ ...newProduct, name: e.target.value })
          }
          className="col-span-3"
          placeholder="Nombre del producto"
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="price" className="text-right">
          Precio *
        </Label>
        <Input
          id="price"
          type="number"
          value={newProduct.price}
          onChange={(e) =>
            setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })
          }
          className="col-span-3"
          placeholder="0.00"
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
          placeholder="https://..."
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
          placeholder="Descripción del producto"
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Selecciona las categorías para tu producto. Puedes elegir múltiples categorías.
      </div>
      <CategorySelector
        selectedCategories={selectedCategories}
        onCategoriesChange={setSelectedCategories}
      />
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Selecciona los atributos para tu producto (opcional). Los atributos ayudan a los clientes a filtrar productos.
      </div>
      <AttributeSelector
        selectedAttributes={selectedAttributes}
        onAttributesChange={setSelectedAttributes}
      />
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Añadir Producto
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Añadir Nuevo Producto</DialogTitle>
        </DialogHeader>

        {/* Step Indicator */}
        <StepIndicator currentStep={currentStep} totalSteps={3} />

        {/* Step Content */}
        <div className="py-4">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4 border-t">
          {currentStep === 1 ? (
            <div /> // Empty div for spacing
          ) : (
            <Button variant="outline" onClick={handleBack}>
              <ChevronLeft className="w-4 h-4 mr-1" />
              Anterior
            </Button>
          )}

          {currentStep < 3 ? (
            <Button onClick={handleNext}>
              Siguiente
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={onAddProduct}>
              Añadir Producto
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductDialog;
