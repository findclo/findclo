import { privateBrandsApiWrapper } from "@/api-wrappers/brands";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { IPromotionAdmin } from "@/lib/backend/models/interfaces/IPromotion";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";

interface ProductPromotionDetailsDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  promotionId: number;
  brandId: string;
  handleStopPromotion: (promotionId: string) => void;
}

const ProductPromotionDetailsDialog: React.FC<ProductPromotionDetailsDialogProps> = ({
  isOpen,
  setIsOpen,
  promotionId,
  brandId,
  handleStopPromotion
}) => {
    const authToken = Cookies.get("Authorization")!;
  const [promotion, setPromotion] = useState<IPromotionAdmin | null>(null);

  useEffect(() => {
    const fetchPromotionDetails = async () => {
      if (isOpen) {
        try {
          const promotion = await privateBrandsApiWrapper.getProductPromotion(authToken, brandId, promotionId);
          if(!promotion) return;
          setPromotion(promotion);
        } catch (error) {
          console.error("Error fetching promotion details:", error);
        }
      }
    };

    fetchPromotionDetails();
  }, [isOpen, promotionId, brandId]);

  if (!promotion) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Detalles de la Promoción</DialogTitle>
          <DialogDescription>
            Creada el {new Date(promotion.created_at).toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>
        <Card>
          <CardContent className="grid gap-4 pt-4">
            <div className="grid grid-cols-2 items-center gap-4">
              <h4 className="font-medium">Créditos Asignados</h4>
              <p className="text-right">{promotion.credits_allocated}</p>
            </div>
            <div className="grid grid-cols-2 items-center gap-4">
              <h4 className="font-medium">Créditos Restantes</h4>
              <p className={`text-right ${promotion.credits_allocated - promotion.credits_spent <= 0 ? 'text-red-500 font-bold' : ''}`}>
                {promotion.credits_allocated - promotion.credits_spent}
              </p>
            </div>
            {(promotion.credits_allocated - promotion.credits_spent <= 0) && (
              <div className="space-y-2">
                <p className="text-sm text-red-500">Esta promoción se ha quedado sin créditos</p>
                <Button 
                  variant="destructive"
                  className="w-full"
                  onClick={() => {
                    handleStopPromotion(promotionId.toString());
                    setIsOpen(false);
                  }}
                >
                  Detener promoción
                </Button>
              </div>
            )}
            <div className="grid grid-cols-2 items-center gap-4">
              <h4 className="font-medium">Mostrar en Landing</h4>
              <Badge variant={promotion.show_on_landing ? "default" : "secondary"} className="justify-self-end">
                {promotion.show_on_landing ? "Sí" : "No"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default ProductPromotionDetailsDialog; 