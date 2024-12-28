'use client'

import { privateBillsApiWrapper } from "@/api-wrappers/bills"
import { BillsList } from "@/components/BillsList"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select"
import { IBill } from "@/lib/backend/models/interfaces/IBill"
import { format, subMonths } from 'date-fns'
import { es } from "date-fns/locale"
import Cookies from "js-cookie"
import { Loader2, Search } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
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
    const [error, setError] = useState<string | null>(null)
    const token = Cookies.get("Authorization")
    const searchParams = useSearchParams()
    const router = useRouter()
    
    // Get period from URL or default to current month
    const defaultPeriod = format(new Date(), 'yyyy-MM')
    const selectedPeriod = searchParams.get('period') || defaultPeriod
    const months = generateLastTwelveMonths()

    // Replace setSelectedPeriod with this function
    const handlePeriodChange = (newPeriod: string) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('period', newPeriod)
        router.push(`?${params.toString()}`)
    }

    useEffect(() => {
        const fetchBills = async () => {
            setLoading(true)
            setError(null)
            
            if (!token) {
                setError("No se encontró token de autorización")
                setLoading(false)
                return
            }

            try {
                const bills = await privateBillsApiWrapper.getBills(token, selectedPeriod)
                setBillsData(bills)
            } catch (error) {
                console.error("Error fetching bills:", error)
                setError("Error al cargar las facturas. Por favor, intente nuevamente.")
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

    const togglePaidStatus = async (billId: number) => {
        const bill = billsData.find((b) => b.billId === billId)
        if (!bill) return

        if (!confirm(`¿Estás seguro de ${bill.isPaid ? 'marcar como pendiente' : 'marcar como paga'} esta factura?`)) {
            return
        }

        setLoading(true)
        setError(null)
        
        try {
            await privateBillsApiWrapper.changeBillStatus(token!, billId)
            const updatedBills = await privateBillsApiWrapper.getBills(token!, selectedPeriod)
            setBillsData(updatedBills)
        } catch (error) {
            console.error("Error updating bill status:", error)
            setError("Error al actualizar el estado de la factura. Por favor, intente nuevamente.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container mx-auto py-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Facturación del período</h2>
                <Select 
                    value={selectedPeriod} 
                    onValueChange={handlePeriodChange}
                    disabled={loading}
                >
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

            {error && (
                <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className="space-y-4">
                <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground"/>
                    <Input
                        placeholder="Buscar marca..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-8"
                        disabled={loading}
                    />
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary"/>
                    </div>
                ) : (
                    <>
                        <BillsList 
                            bills={unpaidBills} 
                            isPaid={false} 
                            onTogglePaidStatus={togglePaidStatus}
                            isLoading={loading}
                        />
                        <BillsList 
                            bills={paidBills} 
                            isPaid={true} 
                            onTogglePaidStatus={togglePaidStatus}
                            isLoading={loading}
                        />
                    </>
                )}
            </div>
        </div>
    )
}
