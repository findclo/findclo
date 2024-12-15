'use client'

import {useCallback, useEffect, useState} from "react"
import {IBill} from "@/lib/backend/models/interfaces/IBill"
import {privateBrandsBillsApiWrapper} from "@/api-wrappers/bills"
import Cookies from "js-cookie"
import {format, subMonths} from 'date-fns'
import {es} from "date-fns/locale"
import {BrandsBillList} from "./BrandBillsList";
import {privateBrandsApiWrapper} from "@/api-wrappers/brands";
import {IBrand} from "@/lib/backend/models/interfaces/brand.interface";
import {Button} from "@/components/ui/button";

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
                const bills = await privateBrandsBillsApiWrapper.getBrandBills(token!, brandId)
                setBillsData(bills)
            } catch (error) {
                console.error("Error fetching bills:", error)
            } finally {
                setLoading(false)
            }
        },
        [])

    useEffect(() => {
        async function loadData() {
            const brandData = await fetchBrandDetails();
            if (brandData) {
                await fetchBills(brandData.id.toString());
            }
        }

        loadData();
    }, [fetchBrandDetails, fetchBills]);


    const currentBill = billsData[0];
    return (
        <div className="container mx-auto py-6">
            <div className="max-w-3xl mx-auto space-y-6">
                 Periodo
                <div className="space-y-4">
                    <div className=" border border-gray-700 rounded-lg p-4 space-y-4">
                        <div className="flex justify-between text-sm">
                            <span>Cliente: {currentBill?.brandName || 'N/A'}</span>
                            <span>Fecha: {format(new Date(currentBill?.period.startDate), 'dd/MM/yyyy', {locale: es})}</span>
                        </div>

                        <div className="space-y-2">
                            {currentBill?.billableItems.map((item, index) => (
                                <div key={index} className=" p-3 rounded">
                                    {item.item_name}: {item.quantity}
                                </div>
                            ))}
                        </div>

                        <div className="pt-4 border-t border-gray-700">
                            <div className=" p-3 rounded">
                                Total: ${currentBill?.totalAmount || '0.00'}
                            </div>
                        </div>

                        <div className="flex justify-center">
                            <Button className="  bg-gray-500 text-white border-gray-700 hover:bg-[#444]">
                                Descargar
                            </Button>
                        </div>
                    </div>
                </div>

                <BrandsBillList bills={billsData}/>
            </div>
        </div>
    )
}

