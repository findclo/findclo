import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { IBrandCredits } from "@/lib/backend/models/interfaces/IBrandCredits";
import { IProduct } from "@/lib/backend/models/interfaces/product.interface";
import { useEffect, useState } from "react";

interface PromoteProductDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  product: IProduct;
  brandCredits: IBrandCredits | null;
  handleProductPromotion: (productId: number, credits_allocated: number, show_on_landing: boolean, keywords?: string[]) => void;
}

const PromoteProductDialog: React.FC<PromoteProductDialogProps> = ({
  isOpen,
  setIsOpen,
  product,
  brandCredits,
  handleProductPromotion
}) => {
    const [promotedProduct, setPromotedProduct] = useState<IProduct | null>(null);
    const [credits_allocated, setCreditsAllocated] = useState(10);
    const [show_on_landing, setShowOnLanding] = useState(true);
    const [keywords, setKeywords] = useState<string[]>([]);
    useEffect(() => {
        setPromotedProduct(product);
    }, [product]);

    const handlePromotion = () => {
        if(promotedProduct){
            handleProductPromotion(promotedProduct.id, credits_allocated, show_on_landing, keywords);
            setIsOpen(false);
        }
    }

  return <Dialog open={isOpen} onOpenChange={setIsOpen}>
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle className="text-xl font-bold">Promoción de producto</DialogTitle>
      </DialogHeader>
      
      <div className="grid gap-6 py-4">

        <div className="rounded-lg bg-secondary/50 p-3 text-sm">
            <span className="font-medium">Créditos disponibles: </span>
            <span className="font-bold text-primary">
              {brandCredits !== null ? brandCredits.credits_available - brandCredits.credits_spent : '...'}
            </span>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Producto</Label>
          <div className="rounded-lg bg-secondary p-3 flex items-center gap-2">
            <img src={promotedProduct?.images[0]} alt={promotedProduct?.name} className="w-16 h-16 object-cover" />
            <span className="font-medium">{promotedProduct?.name}</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="credits_allocated">
            Créditos asignados<span className="text-red-500">*</span>
          </Label>
          <Input
            id="credits_allocated"
            type="number"
            min="0"
            value={credits_allocated}
            required
            onChange={(e) => setCreditsAllocated(parseInt(e.target.value))}
          />
        </div>

        <div className="space-y-2">
            <Label htmlFor="keywords">Palabras clave <span className="text-xs text-gray-500">(Separadas por comas)</span></Label>
            <Input
                id="keywords"
                type="text"
                value={keywords.join(", ")}
                onChange={(e) => setKeywords(e.target.value.split(",").map(keyword => keyword.trim()))}
            />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="show_on_landing"
            checked={show_on_landing}
            onCheckedChange={setShowOnLanding}
          />
          <Label htmlFor="show_on_landing" className="cursor-pointer">
            Mostrar en la página de inicio<span className="text-red-500">*</span>
          </Label>
        </div>

        {(credits_allocated === 0 || credits_allocated > (brandCredits?.credits_available || 0)) && (
          <p className="text-sm text-red-500 text-center">
            {credits_allocated === 0 
              ? "Debes asignar al menos 1 crédito"
              : `No tienes suficientes créditos disponibles. Máximo: ${brandCredits?.credits_available}`
            }
          </p>
        )}

        <button
          onClick={handlePromotion}
          disabled={
            !brandCredits || 
            credits_allocated > brandCredits.credits_available ||
            credits_allocated === 0 ||
            !show_on_landing ||
            !(credits_allocated > 0 && show_on_landing)
          }
          className="w-full rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Confirmar promoción
        </button>
      </div>
    </DialogContent>
  </Dialog>
}

export default PromoteProductDialog;