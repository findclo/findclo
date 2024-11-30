'use client'

import {Check, Search, X} from 'lucide-react'
import {useEffect, useState} from "react"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select"
import {Input} from "@/components/ui/input"
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,} from "@/components/ui/dialog"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table"
import {IBill} from "@/lib/backend/models/interfaces/IBill";
import {privateBillsApiWrapper} from "@/api-wrappers/bills";
import Cookies from "js-cookie";
import {Button} from "@/components/ui/button";


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

    const BillList = ({bills, isPaid}: { bills: IBill[], isPaid: boolean }) => (
        <div className="space-y-4">
            <h3 className="text-xl font-semibold">{isPaid ? 'Facturas pagadas' : 'Facturas pendientes'}</h3>
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
                                    <span className="font-semibold">${bill.totalAmount}</span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            togglePaidStatus(bill.billId);
                                        }}
                                    >
                                        {bill.isPaid ? <X className="h-4 w-4 mr-2"/> :
                                            <Check className="h-4 w-4 mr-2"/>}
                                        {bill.isPaid ? 'Marcar como no pagada' : 'Marcar como pagada'}
                                    </Button>
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
                                                <TableCell>{item.item_name}</TableCell>
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
        </div>
    )

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
                <BillList bills={unpaidBills} isPaid={false}/>
                <BillList bills={paidBills} isPaid={true}/>
            </div>
        </div>
    )
}
