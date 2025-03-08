'use client'

import { privateBillsApiWrapper, privateBrandsBillsApiWrapper } from "@/api-wrappers/bills"
import { privateBrandsApiWrapper } from "@/api-wrappers/brands"
import { IBillableItem } from "@/lib/backend/models/interfaces/billableItem.interface"
import { IBrand } from "@/lib/backend/models/interfaces/brand.interface"
import { IBill } from "@/lib/backend/models/interfaces/IBill"
import { ProductInteractionEnum } from "@/lib/backend/models/interfaces/metrics/productInteraction.interface"
import { format, subMonths } from 'date-fns'
import { es } from "date-fns/locale"
import Cookies from "js-cookie"
import { useCallback, useEffect, useState } from "react"
import { BrandsBillList } from "./BrandBillsList"

function generateLastTwelveMonths() {
    const months = []
    for (let i = 0; i < 12; i++) {
        const date = subMonths(new Date(), i)
        const value = format(date, 'yyyy-MM')
        const label = format(date, 'MMMM yyyy', {locale: es})
        months.push({value, label})
    }
    return months
}

export default function BillingDashboard() {
    const [brand, setBrand] = useState<IBrand | null>(null);
    const [search, setSearch] = useState("")
    const [billsData, setBillsData] = useState<IBill[]>([])
    const [loading, setLoading] = useState(true)
    const [billableItems, setBillableItems] = useState<IBillableItem[]>([])
    const token = Cookies.get("Authorization")!;
    const months = generateLastTwelveMonths()
    const fetchBrandDetails = useCallback(async () => {
        const brandData = await privateBrandsApiWrapper.getMyBrand(token);
        setBrand(brandData);
        return brandData;
    }, []);
    const fetchBills = useCallback(
        async (brandId: string) => {
            try {
                setLoading(true);
                const bills = await privateBrandsBillsApiWrapper.getBrandBills(token!, brandId)
                setBillsData(bills)
            } catch (error) {
                console.error("Error fetching bills:", error)
            } finally {
                setLoading(false)
            }
        },
        [])

    const fetchBillableItems = useCallback(async () => {
        try {
            const items = await privateBillsApiWrapper.getBillableItems(token);
            setBillableItems(items);
        } catch (error) {
            console.error("Error fetching billable items:", error);
        }
    }, [token]);

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

    useEffect(() => {
        async function loadData() {
            const brandData = await fetchBrandDetails();
            if (brandData) {
                await fetchBills(brandData.id.toString());
                await fetchBillableItems();
            }
        }

        loadData();
    }, [fetchBrandDetails, fetchBills, fetchBillableItems]);


    const currentBill = billsData[0];
    return (
        <div className="container mx-auto py-6">
            <div className="max-w-3xl mx-auto space-y-6">
                <h2 className="text-2xl font-bold">Ultimo periodo</h2>
                <div className="space-y-4">
                    {billsData.length > 0 ? (
                        <div className="border border-gray-700 rounded-lg p-4 space-y-4">
                            <div className="flex justify-between text-sm">
                                <span>Cliente: {currentBill?.brandName || 'N/A'}</span>
                                <span>Fecha desde: {format(new Date(currentBill?.period.startDate), 'dd/MM/yyyy', {locale: es})}</span>
                                <span>Fecha hasta: {format(new Date(currentBill?.period.endDate), 'dd/MM/yyyy', {locale: es})}</span>
                            </div>

                            <div className="space-y-2">
                                {currentBill?.billableItems.map((item, index) => (
                                    <div key={index} className="p-3 rounded">
                                        {itemNamesMap[item.item_name as keyof typeof itemNamesMap]?.label}: {item.quantity}
                                    </div>
                                ))}
                            </div>

                            <div className="pt-4 border-t border-gray-700">
                                <div className="p-3 rounded">
                                    Total: ${currentBill?.totalAmount || '0.00'}
                                </div>
                            </div>

                            {/*<div className="flex justify-center">*/}
                            {/*    <Button className="bg-gray-500 text-white border-gray-700 hover:bg-[#444]">*/}
                            {/*        Descargar*/}
                            {/*    </Button>*/}
                            {/*</div>*/}
                        </div>
                    ) : (
                        <div className="border border-gray-700 rounded-lg p-4 text-center">
                            <p className="text-lg font-semibold">No hay facturas disponibles</p>
                            <p className="text-sm text-gray-500">No se encontraron facturas para mostrar en
                                este periodo.</p>
                        </div>
                    )}
                </div>

                <BrandsBillList bills={billsData}/>
                
                <div className="mt-8">
                    <h2 className="text-2xl font-bold mb-4">Listado de precios</h2>
                    <div className="border border-gray-700 rounded-lg p-4">
                        <div className="grid gap-4">
                            {billableItems.length > 0 ? (
                                billableItems.map((item) => (
                                    <div key={item.name} className="flex justify-between items-center py-2 border-b border-gray-700 last:border-0">
                                        <span className="font-medium">
                                            {itemNamesMap[item.name as keyof typeof itemNamesMap]?.label || item.name}
                                        </span>
                                        <span className="font-semibold">${item.price} ARS</span>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-4">
                                    <p className="text-gray-500">Cargando información de precios...</p>
                                </div>
                            )}
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        Estos son los precios actuales para cada tipo de interacción. Para más información, contacte con soporte.
                    </p>
                </div>
            </div>
        </div>
    )
}

