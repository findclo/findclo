import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import type { IBillableItem } from "@/lib/backend/models/interfaces/billableItem.interface"
import { privateBillsApiWrapper } from "@/api-wrappers/bills"
import toast from "@/components/toast";
import {ProductInteractionEnum} from "@/lib/backend/models/interfaces/metrics/productInteraction.interface";

type ConfigurationModalProps = {
    token: string | undefined
    isOpen: boolean
    onClose: () => void
}

export function ConfigurationModal({ token, isOpen, onClose }: ConfigurationModalProps) {
    const itemNamesMap = {
        [ProductInteractionEnum.VIEW_IN_LISTING_RELATED]: {
            label: 'Vistas en listado relacionado',
        },
        [ProductInteractionEnum.VIEW_IN_LISTING_PROMOTED]: {
            label: 'Vistas en listado promocionado',
        },
        [ProductInteractionEnum.CLICK]: {
            label: 'Clics',
        },
        [ProductInteractionEnum.NAVIGATE_TO_BRAND_SITE]: {
            label: 'Navegaciones al sitio de la marca',
        }
    };

    const [billableItems, setBillableItems] = useState<IBillableItem[]>([])

    const handleInputChange = (name: string, price: number) => {
        if(price<0){
            return;
        }
        setBillableItems((prevItems) => {
            const updatedItems = prevItems.map((item) =>
                item.name === name ? { ...item, price: isNaN(price) ? 0 : price } : item,
            )
            return updatedItems
        })
    }

    useEffect(() => {
        const fetchBillableItems = async () => {
            if (!token) {
                return
            }

            try {
                const items = await privateBillsApiWrapper.getBillableItems(token)
                console.log(items)
                setBillableItems(items)
            } catch (error) {
                console.error("Error fetching billable items:", error)
            }
        }
        fetchBillableItems()
    }, [token, isOpen])

    const handleSave = () => {
        if (token) {
            try {
                privateBillsApiWrapper.updateBillableItems(token, billableItems)
                toast({
                    type: "success",
                    message: `Se actualizaron correctamente los nuevos precios.`,
                });
                console.log("Billable items updated successfully")
            } catch (error) {
                console.error("Error updating billable items:", error)
                toast({
                    type: "error",
                    message: `Hubo un error al actualizar los precios, por favor intente nuevamente.`,
                });
            }
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                    <DialogTitle>Configurar precios</DialogTitle>
                    <DialogDescription>Establezca los precios para cada tipo de interacción del producto.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    {billableItems.map((item) => (
                        <div key={item.name} className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor={item.name} className="text-right col-span-2">
                                {((itemNamesMap[item.name]?.label) || item.name)}
                            </Label>
                            <div className="col-span-2 flex items-center">
                                <Input
                                    id={item.name}
                                    type="number"
                                    value={item.price}
                                    onChange={(e) => handleInputChange(item.name, Number(e.target.value))}
                                    className="flex-grow"
                                />
                                <span className="ml-2">ARS</span>
                            </div>
                        </div>
                    ))}
                </div>
                <DialogFooter>
                    <Button type="submit" onClick={handleSave}>
                        Guardar cambios
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}