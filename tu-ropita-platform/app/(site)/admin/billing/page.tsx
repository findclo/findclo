'use client'

import {Search} from 'lucide-react'
import {useEffect, useState} from "react"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select"
import {Input} from "@/components/ui/input"
import {IBill} from "@/lib/backend/models/interfaces/IBill";
import {privateBillsApiWrapper} from "@/api-wrappers/bills";
import Cookies from "js-cookie";
import {BillsList} from "@/components/BillsList";


export default function BillingDashboard() {
    const [search, setSearch] = useState("")
    const [billsData, setBillsData] = useState<IBill[]>([])
    const [loading, setLoading] = useState(true)
    const token = Cookies.get("Authorization");

    useEffect(() => {
        const fetchBills = async () => {
            try {
                const bills = await privateBillsApiWrapper.getBills(token!)
                setBillsData(bills)
            } catch (error) {
                console.error("Error fetching bills:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchBills()
    }, [token])

    const filteredBills = billsData.filter(bill =>
        bill.brandName.toLowerCase().includes(search.toLowerCase())
    )

    const unpaidBills = filteredBills.filter(bill => !bill.isPaid)
    const paidBills = filteredBills.filter(bill => bill.isPaid)

    const togglePaidStatus = (billId: number) => {
        setBillsData(prevBills =>
            prevBills.map(bill =>
                bill.billId === billId ? {...bill, isPaid: !bill.isPaid} : bill
            )
        )
    }

    return (
        <div className="container mx-auto py-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Facturación del período</h2>
                <Select defaultValue="current">
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Seleccionar mes"/>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="current">Mes actual</SelectItem>
                        <SelectItem value="previous">Mes anterior</SelectItem>
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
