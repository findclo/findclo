'use client';

import { privateBrandsApiWrapper } from '@/api-wrappers/brands';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IBrandDto } from '@/lib/backend/dtos/brand.dto.interface';
import { IBrand } from '@/lib/backend/models/interfaces/brand.interface';
import Cookies from 'js-cookie';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';

export default function AdminShopProfile() {
    const [brand, setBrand] = useState<IBrand | null>(null);
    const authToken = Cookies.get('Authorization')!;
    const [isEditing, setIsEditing] = useState(false);
    const [editedBrand, setEditedBrand] = useState<IBrandDto | null>(null);
  
    const fetchBrandDetails = useCallback(async () => {
      const brandData = await privateBrandsApiWrapper.getMyBrand(authToken);
      setBrand(brandData);
      return brandData;
    }, []);


    useEffect(() => {
        async function loadData() {
          const brandData = await fetchBrandDetails();
          if (brandData) {
            setBrand(brandData);
            setEditedBrand(brandData);
            console.log(brandData);
          }
        }
        loadData();
    }, [fetchBrandDetails]);

    if (!brand) {
        return (
          <div className="flex justify-center items-center h-screen">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        )
    }

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedBrand(brand as IBrandDto);
  };

  const handleSave = async () => {
    if (authToken && brand && editedBrand) {
      const updatedBrand = await privateBrandsApiWrapper.updateBrand(authToken, brand.id.toString(), editedBrand);
      if (updatedBrand) {
        setBrand(updatedBrand);
        setIsEditing(false);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedBrand(prev => prev ? { ...prev, [name]: value } : null);
  };

  if (!brand) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Perfil de la tienda</h1>
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="flex flex-col md:flex-row gap-8 p-6">
          <div className="w-full md:w-1/3 flex flex-col items-center">
            <Image
              src={isEditing ? editedBrand?.image || '/placeholder-image.jpg' : brand.image || '/placeholder-image.jpg'}
              alt={brand.name}
              width={200}
              height={200}
              className="rounded-lg mb-4"
            />
            {isEditing ? (
              <div className="w-full space-y-2">
                <Label htmlFor="image">URL de la imagen</Label>
                <Input
                  id="image"
                  name="image"
                  value={editedBrand?.image || ''}
                  onChange={handleChange}
                  placeholder="URL de la imagen"
                />
              </div>
            ) : (
              <Button onClick={handleEdit} className="w-full">Editar perfil</Button>
            )}
          </div>
          <div className="w-full md:w-2/3">
            {isEditing ? (
              <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    name="name"
                    value={editedBrand?.name || ''}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <textarea
                    id="description"
                    name="description"
                    value={editedBrand?.description || ''}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md"
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="websiteUrl">URL de la página web</Label>
                  <Input
                    id="websiteUrl"
                    name="websiteUrl"
                    value={editedBrand?.websiteUrl || ''}
                    onChange={handleChange}
                  />
                </div>
                {/* Add more form fields for other brand properties */}
                <div className="flex justify-end space-x-2 mt-4">
                  <Button variant="outline" onClick={handleCancel}>Cancelar</Button>
                  <Button type="submit">Guardar</Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">{brand.name}</h2>
                <p className={`${!brand.description && 'italic'} ${!brand.description && 'text-gray-600'}`}>
                  <span className="font-bold">Descripción:</span> {brand.description || 'No existe descripción para esta tienda.'}
                </p>
                <p><strong>Página web:</strong> <a href={brand.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{brand.websiteUrl}</a></p>
                {/* Display other brand properties */}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
