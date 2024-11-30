'use client'

import {Search} from 'lucide-react'
import {useState} from "react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {Input} from "@/components/ui/input"
export default function BillingDashboard() {
    const [pendingSearch, setPendingSearch] = useState("")
    const [paidSearch, setPaidSearch] = useState("")

    const pendingBusinesses = [
        {id: 1, name: "Comercio X"},
        {id: 2, name: "Comercio Y"},
    ]

    const paidBusinesses = [
        {id: 3, name: "Comercio X"},
        {id: 4, name: "Comercio Y"},
    ]

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

            <div className="space-y-6">
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Pendientes de pago</h3>
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground"/>
                        <Input
                            placeholder="Buscar comercio..."
                            value={pendingSearch}
                            onChange={(e) => setPendingSearch(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                    <div className="border rounded-lg">
                        {pendingBusinesses.map((business) => (
                            <div
                                key={business.id}
                                className="flex items-center justify-between p-4 border-b last:border-b-0"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="font-medium">{business.name}</span>
                                </div>
                                <div className="flex gap-2">
                                    <button className="p-2 hover:bg-gray-100 rounded">📋</button>
                                    <button className="p-2 hover:bg-gray-100 rounded">📊</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Pagadas</h3>
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground"/>
                        <Input
                            placeholder="Buscar comercio..."
                            value={paidSearch}
                            onChange={(e) => setPaidSearch(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                    <div className="border rounded-lg">
                        {paidBusinesses.map((business) => (
                            <div
                                key={business.id}
                                className="flex items-center justify-between p-4 border-b last:border-b-0"
                            >
                                <div className="flex items-center gap-3">
                                    {/*<Avatar/>*/}
                                    <span className="font-medium">{business.name}</span>
                                </div>
                                <div className="flex gap-2">
                                    <button className="p-2 hover:bg-gray-100 rounded">📋</button>
                                    <button className="p-2 hover:bg-gray-100 rounded">📊</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

        </div>
    )
}