"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pause, Play, Store } from "lucide-react"
import Image from "next/image"
import {BrandStatus, IBrand} from "@/lib/backend/models/interfaces/brand.interface"
import { privateBrandsApiWrapper } from "@/api-wrappers/brands"
import Cookies from "js-cookie"
import { Input } from "@/components/ui/input"
import {useRouter} from "next/navigation";
import toast from "@/components/toast";

export default function AdminBrandList() {
    const [brands, setBrands] = useState<IBrand[]>([])
    const [loading, setLoading] = useState(false)
    const [search, setSearch] = useState('')
    const router = useRouter()

    useEffect(() => {
        const fetchBrands = async () => {
            setLoading(true)
            try {
                const token = Cookies.get('Authorization')!
                const response = await privateBrandsApiWrapper.listAllBrands(token)
                if (response) {
                    setBrands(response)
                } else {
                    console.log("No data received")
                }
            } catch (error) {
                console.error("Failed to fetch brands", error)
            } finally {
                setLoading(false)
            }
        }
        fetchBrands()
    }, [])

    const toggleShopStatus = async (id: number) => {
        const token = Cookies.get('Authorization')!;
        const brand = brands.find(brand => brand.id === id);
        if (!brand) return;

        const newStatus = brand.status === BrandStatus.ACTIVE ? BrandStatus.PAUSED : BrandStatus.ACTIVE;
        const updatedBrand = await privateBrandsApiWrapper.changeBrandStatus(token, id.toString(), newStatus);

        if (updatedBrand) {
            setBrands(brands.map(b => b.id === id ? { ...b, status: newStatus } : b));
            toast({
                type: 'success',
                message: `Comercio ${newStatus === BrandStatus.ACTIVE ? 'activado' : 'pausado'} correctamente`
            });
        }else{
            toast({
                type: 'error',
                message: `Hubo un error al ${newStatus === BrandStatus.ACTIVE ? 'actir' : 'pausar'} el comercio. Intente nuevamente`
            });
        }
    }

    const filteredBrands = brands.filter((brand) =>
        brand.name.toLowerCase().includes(search.toLowerCase())
    )

    if (loading) {
        return <div>Loading...</div>
    }

    return (
        <div className="mb-4">
            <Input
                placeholder="Buscar comercios"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-sm"/>
        <div className="overflow-x-auto max-h-[500px]">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[50px] sticky top-0 z-10 bg-white">Logo</TableHead>
                            <TableHead className="sticky top-0 z-10 bg-white">Nombre</TableHead>
                            <TableHead className="sticky top-0 z-10 bg-white">URL</TableHead>
                            <TableHead className="sticky top-0 z-10 bg-white">Estado</TableHead>
                            <TableHead className="text-right sticky top-0 z-10 bg-white">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredBrands.map((brand) => (
                            <TableRow key={brand.id}>
                                <TableCell>
                                    <Image src={brand.image} alt={`${brand.name} logo`} width={40} height={40} className="rounded-full" />
                                </TableCell>
                                <TableCell className="font-medium">{brand.name}</TableCell>
                                <TableCell>{brand.websiteUrl}</TableCell>
                                <TableCell>
                                    <span className={`px-2 py-1 rounded-full text-xs ${brand.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {brand.status ? brand.status : 'Paused'}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="outline" size="sm" className="mr-2" onClick={() => toggleShopStatus(brand.id)}>
                                        {brand.status === 'ACTIVE' ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                                        {brand.status === 'ACTIVE' ? 'Pausar' : 'Activar'}
                                    </Button>
                                    <Button variant="secondary" size="sm" onClick={() => router.push(`/admin/brand/${brand.id}`)}>
                                        <Store className="mr-2 h-4 w-4" />
                                        Detalles
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}