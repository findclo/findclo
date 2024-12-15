import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,} from "@/components/ui/dialog";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table";
import {IBill} from "@/lib/backend/models/interfaces/IBill";
import {ProductInteractionEnum} from "@/lib/backend/models/interfaces/metrics/productInteraction.interface";
import React from "react";

interface BrandsBillListProps {
    bills: IBill[];
}

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

export function BrandsBillList({bills}: BrandsBillListProps) {
    return (
        <div className="space-y-4 border border-gray-400 p-4 rounded-lg">
            <h3 className="text-xl font-semibold">Facturas de su comercio</h3>
            {bills.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No hay facturas en
                    este momento.</p>
            ) : (
                <div className="border rounded-lg">
                    {bills.map((bill) => (
                        <Dialog key={bill.billId}>
                            <DialogTrigger asChild>
                                <div
                                    className="flex items-center justify-between p-4 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <div>
                                            <span className="font-medium">{bill.brandName}</span>
                                            <p className="text-sm text-gray-500">
                                                {new Date(bill.period.startDate).toLocaleDateString()} - {new Date(bill.period.endDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                      <span
                                          className={`px-2 py-1 text-sm rounded ${bill.isPaid ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}>
                                            {bill.isPaid ? 'PAGADO' : 'PENDIENTE'}
                                        </span>
                                        <span className="font-semibold">${bill.totalAmount}</span>
                                    </div>
                                </div>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl">
                                <DialogHeader>
                                    <DialogTitle>Detalle de factura - {bill.brandName}</DialogTitle>
                                </DialogHeader>
                                <div className="mt-4">
                                    <p>
                                        <strong>Período:</strong> {new Date(bill.period.startDate).toLocaleDateString()} - {new Date(bill.period.endDate).toLocaleDateString()}
                                    </p>
                                    <p><strong>Total:</strong> ${bill.totalAmount}</p>
                                    <p><strong>Estado:</strong> {bill.isPaid ? 'Pagada' : 'Pendiente'}</p>
                                    <Table className="mt-4">
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Concepto</TableHead>
                                                <TableHead>Cantidad</TableHead>
                                                <TableHead>Precio unitario</TableHead>
                                                <TableHead>Total</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {bill.billableItems.map((item, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>{item.item_name ? ((itemNamesMap[item.item_name as keyof typeof itemNamesMap]?.label as string) || item.item_name) : "N/A"}</TableCell>
                                                    <TableCell>{item.quantity}</TableCell>
                                                    <TableCell>${item.unit_price?.toFixed(2)}</TableCell>
                                                    <TableCell>${item.total_price?.toFixed(2)}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </DialogContent>
                        </Dialog>
                    ))}
                </div>
            )}
        </div>
    )
}

