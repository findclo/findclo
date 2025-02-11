"use client"

import { privateBillsApiWrapper } from "@/api-wrappers/bills"
import { BillsList } from "@/components/BillsList"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { IBill } from "@/lib/backend/models/interfaces/IBill"
import { format, subMonths } from "date-fns"
import { es } from "date-fns/locale"
import Cookies from "js-cookie"
import { Loader2, Search, Settings, FilePlus } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import {ProductInteractionEnum} from "@/lib/backend/models/interfaces/metrics/productInteraction.interface";
import {ConfigurationModal} from "./PricingConfigurationModal";
import {IBillableItem} from "@/lib/backend/models/interfaces/billableItem.interface";
import ToastMessage from "@/components/toast"

function generateLastTwelveMonths() {
    const months = []
    for (let i = 0; i < 12; i++) {
        const date = subMonths(new Date(), i)
        const value = format(date, "yyyy-MM")
        const label = format(date, "MMMM yyyy", { locale: es })
        months.push({ value, label })
    }
    return months
}

export default function BillingDashboard() {
    const [search, setSearch] = useState("")
    const [billsData, setBillsData] = useState<IBill[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isConfigModalOpen, setIsConfigModalOpen] = useState(false)
    const token = Cookies.get("Authorization")
    const searchParams = useSearchParams()
    const router = useRouter()

    // Get period from URL or default to current month
    const defaultPeriod = format(new Date(), "yyyy-MM")
    const selectedPeriod = searchParams.get("period") || defaultPeriod
    const months = generateLastTwelveMonths()

    // Replace setSelectedPeriod with this function
    const handlePeriodChange = (newPeriod: string) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set("period", newPeriod)
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

    const filteredBills = billsData.filter((bill) => bill.brandName.toLowerCase().includes(search.toLowerCase()))

    const unpaidBills = filteredBills.filter((bill) => !bill.isPaid)
    const paidBills = filteredBills.filter((bill) => bill.isPaid)

    const togglePaidStatus = async (billId: number) => {
        const bill = billsData.find((b) => b.billId === billId)
        if (!bill) return

        if (!confirm(`¿Estás seguro de ${bill.isPaid ? "marcar como pendiente" : "marcar como paga"} esta factura?`)) {
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

    const handleGenerateBill = async () => {
        // Get last month in yyyy-MM format
        const lastMonth = format(subMonths(new Date(), 1), "yyyy-MM");
        
        if (!confirm(`¿Estás seguro de generar las facturas para el período ${lastMonth}?`)) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const result = await privateBillsApiWrapper.generateBill(token!);
            // After generation, switch to the last month period and refresh bills
            handlePeriodChange(lastMonth);
            const updatedBills = await privateBillsApiWrapper.getBills(token!, lastMonth);
            setBillsData(updatedBills);
            
            if (result.failed > 0) {
                ToastMessage({
                    type: "warning",
                    message: `Se generaron ${result.succeeded} facturas correctamente y ${result.failed} fallaron.`,
                });
                
                // Log details for failed generations
                result.details
                    .filter(d => d.status === 'failed')
                    .forEach(d => {
                        console.error(`Error generando factura para ${d.brandName}: ${d.error}`);
                    });
            } else {
                ToastMessage({
                    type: "success",
                    message: `Se generaron ${result.succeeded} facturas correctamente.`,
                });
            }
        } catch (error) {
            console.error("Error generating bills:", error);
            setError("Error al generar las facturas. Por favor, intente nuevamente.");
            
            ToastMessage({
                type: "error",
                message: "Hubo un error al generar las facturas. Por favor, intente nuevamente.",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto py-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Facturación del período</h2>
                <div className="flex items-center space-x-2">
                    <Select value={selectedPeriod} onValueChange={handlePeriodChange} disabled={loading}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Seleccionar mes y año" />
                        </SelectTrigger>
                        <SelectContent>
                            {months.map((month) => (
                                <SelectItem key={month.value} value={month.value}>
                                    {month.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button 
                        onClick={handleGenerateBill} 
                        disabled={loading}
                        variant="secondary"
                    >
                        <FilePlus className="mr-2 h-4 w-4" />
                        Generar Facturas
                    </Button>
                    <Button onClick={() => setIsConfigModalOpen(true)} disabled={loading}>
                        <Settings className="mr-2 h-4 w-4" />
                        Configurar precios
                    </Button>
                </div>
            </div>

            {error && (
                <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className="space-y-4">
                <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
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
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <>
                        <BillsList bills={unpaidBills} isPaid={false} onTogglePaidStatus={togglePaidStatus} isLoading={loading} />
                        <BillsList bills={paidBills} isPaid={true} onTogglePaidStatus={togglePaidStatus} isLoading={loading} />
                    </>
                )}
            </div>

            <ConfigurationModal
                isOpen={isConfigModalOpen}
                onClose={() => setIsConfigModalOpen(false)}
                token={token}
            />
        </div>
    )
}