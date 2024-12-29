'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {privateBrandsApiWrapper} from "@/api-wrappers/brands";
import {FileDown} from "lucide-react";

interface DownloadCsvButtonProps {
    authToken: string;
    brandId: number;
}

export default function DownloadProductsTagsButton({ authToken, brandId }: DownloadCsvButtonProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleDownload = async () => {
        setIsLoading(true);
        try {
            const blob = await privateBrandsApiWrapper.getBrandProductsTagsCsvAsPrivilegedUser(authToken, brandId);
            if (blob) {
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'products_tags.csv');
                document.body.appendChild(link);
                link.click();

                link.parentNode?.removeChild(link);
                window.URL.revokeObjectURL(url);
            } else {
                console.error('No se pudo obtener el archivo CSV');
            }
        } catch (error) {
            console.error('Error al descargar el CSV:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button variant={"outline"} onClick={handleDownload} disabled={isLoading}>
            <FileDown className="mr-2 h-4 w-4" /> Exportar etiquetas
        </Button>
    );
}

