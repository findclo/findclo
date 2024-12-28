'use client'

import { privateBillsApiWrapper } from "@/api-wrappers/bills"
import { BillsList } from "@/components/BillsList"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select"
import { IBill } from "@/lib/backend/models/interfaces/IBill"
import { format, subMonths } from 'date-fns'
import { es } from "date-fns/locale"
import Cookies from "js-cookie"
import { Search } from 'lucide-react'
import { useEffect, useState } from "react"

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
    const [search, setSearch] = useState("")
    const [billsData, setBillsData] = useState<IBill[]>([])
    const [loading, setLoading] = useState(true)
    const token = Cookies.get("Authorization");
    const [selectedPeriod, setSelectedPeriod] = useState(format(new Date(), 'yyyy-MM'))
    const months = generateLastTwelveMonths()

    useEffect(() => {
        const fetchBills = async () => {
            try {
                const bills = await privateBillsApiWrapper.getBills(token!,selectedPeriod)
                setBillsData(bills)
            } catch (error) {
                console.error("Error fetching bills:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchBills()
    }, [token, selectedPeriod])

    const filteredBills = billsData.filter(bill =>
        bill.brandName.toLowerCase().includes(search.toLowerCase())
    )

    const unpaidBills = filteredBills.filter(bill => !bill.isPaid)
    const paidBills = filteredBills.filter(bill => bill.isPaid)

    const togglePaidStatus = (billId: number) => {
        setBillsData((prevBills) => {
            const bill = prevBills.find((b) => b.billId === billId);
            if (!bill) return prevBills;

            if (!confirm(`¿Estás seguro de ${bill.isPaid ? 'marcar como pendiente' : 'marcar como paga'} esta factura?`)) {
                return prevBills;
            }
            privateBillsApiWrapper.changeBillStatus(token!, billId);
            return prevBills.map((b) =>
                b.billId === billId ? {...b, isPaid: !b.isPaid} : b
            );
        });
    };


    return (
        <div className="container mx-auto py-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Facturación del período</h2>
                <Select defaultValue={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Seleccionar mes y año"/>
                    </SelectTrigger>
                    <SelectContent>
                        {months.map((month) => (
                            <SelectItem key={month.value} value={month.value}>
                                {month.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-4">
                <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground"/>
                    <Input
                        placeholder="Buscar marca..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-8"
                    />
                </div>
                <BillsList bills={unpaidBills} isPaid={false} onTogglePaidStatus={togglePaidStatus}/>
                <BillsList bills={paidBills} isPaid={true} onTogglePaidStatus={togglePaidStatus}/>
            </div>
        </div>
    )
}
