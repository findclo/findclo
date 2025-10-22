"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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

interface UpsertProductStepperProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  product?: IProduct | null;
  handleSubmit: (
    productData: Omit<Partial<IProduct>, 'attributes'>,
    category_ids?: number[],
    attributes?: IProductAttributeAssignment[]
  ) => void;
}

const UpsertProductStepper: React.FC<UpsertProductStepperProps> = ({
  isOpen,
  setIsOpen,
  product,
  handleSubmit,
}) => {
  const isEditMode = !!product;
  const [currentStep, setCurrentStep] = useState(1);
  const [productData, setProductData] = useState<Partial<IProduct>>({
    name: "",
    price: 0,
    images: [""],
    description: "",
    url: "",
  });
  const [selectedCategories, setSelectedCategories] = useState<Set<number>>(new Set());
  const [selectedAttributes, setSelectedAttributes] = useState<Map<number, Set<number>>>(new Map());

  // Initialize state when product changes or dialog opens
  useEffect(() => {
    if (isOpen) {
      if (isEditMode && product) {
        // Edit mode: populate with existing product data
        setProductData({
          name: product.name || "",
          price: product.price || 0,
          images: product.images && product.images.length > 0 ? product.images : [""],
          description: product.description || "",
          url: product.url || "",
        });

        // Load existing categories
        if (product.categories && product.categories.length > 0) {
          setSelectedCategories(new Set(product.categories.map(cat => cat.id)));
        } else {
          setSelectedCategories(new Set());
        }

        // Load existing attributes
        if (product.attributes && product.attributes.length > 0) {
          const attributesMap = new Map<number, Set<number>>();
          product.attributes.forEach(attr => {
            if (attr.value && attr.value.length > 0) {
              const existingValues = attributesMap.get(attr.attribute_id) || new Set<number>();
              existingValues.add(attr.value_id);
              attributesMap.set(attr.attribute_id, existingValues);
            }
          });
          setSelectedAttributes(attributesMap);
        } else {
          setSelectedAttributes(new Map());
        }
      } else {
        // Create mode: reset to default values
        setProductData({
          name: "",
          price: 0,
          images: [""],
          description: "",
          url: "",
        });
        setSelectedCategories(new Set());
        setSelectedAttributes(new Map());
      }
      setCurrentStep(1);
    }
  }, [isOpen, isEditMode, product]);

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...(productData.images || [])];
    newImages[index] = value;
    setProductData({ ...productData, images: newImages });
  };

  const addImageField = () => {
    setProductData({ ...productData, images: [...(productData.images || []), ""] });
  };

  const removeImageField = (index: number) => {
    const newImages = (productData.images || []).filter((_, i) => i !== index);
    setProductData({ ...productData, images: newImages });
  };

  // Validation for step 1
  const validateStep1 = (): boolean => {
    if (!productData.name || productData.name.trim() === "") {
      toast({ type: "error", message: "El nombre del producto es obligatorio." });
      return false;
    }
    if (!productData.price || productData.price <= 0) {
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

  const onSubmit = async () => {
    // Convert selectedAttributes Map to IProductAttributeAssignment[]
    const attributes: IProductAttributeAssignment[] = Array.from(selectedAttributes.entries()).map(
      ([attribute_id, value_ids]) => ({
        attribute_id,
        value_ids: Array.from(value_ids)
      })
    );

    const filteredProduct = {
      ...productData,
      images: (productData.images || []).filter(url => url.trim() !== ""),
    };

    await handleSubmit(
      filteredProduct,
      Array.from(selectedCategories),
      attributes  // Always pass attributes array, even if empty (to clear all attributes when none selected)
    );

    // Reset form after successful submission
    setProductData({ name: "", price: 0, images: [""], description: "", url: "" });
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
          value={productData.name}
          onChange={(e) =>
            setProductData({ ...productData, name: e.target.value })
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
          value={productData.price}
          onChange={(e) =>
            setProductData({ ...productData, price: parseFloat(e.target.value) })
          }
          className="col-span-3"
          placeholder="0.00"
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">URLs de Imágenes</Label>
        <div className="col-span-3 space-y-2">
          {(productData.images || []).map((image, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={image}
                onChange={(e) => handleImageChange(index, e.target.value)}
                placeholder={`URL de imagen ${index + 1}`}
              />
              {(productData.images || []).length > 1 && (
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
          value={productData.url || ""}
          onChange={(e) =>
            setProductData({ ...productData, url: e.target.value })
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
          value={productData.description}
          onChange={(e) =>
            setProductData({ ...productData, description: e.target.value })
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
        Selecciona los atributos para tu producto (opcional). Los atributos ayudan a los clientes a
        filtrar productos.
      </div>
      <AttributeSelector
        selectedAttributes={selectedAttributes}
        onAttributesChange={setSelectedAttributes}
      />
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Editar Producto" : "Añadir Nuevo Producto"}</DialogTitle>
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
            <Button onClick={onSubmit}>
              {isEditMode ? "Actualizar Producto" : "Añadir Producto"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpsertProductStepper;

