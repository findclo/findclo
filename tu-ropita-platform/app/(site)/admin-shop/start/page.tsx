'use client'

import { privateBrandsApiWrapper } from '@/api-wrappers/brands';
import { Button } from "@/components/ui/button";
import { IBrandDto } from '@/lib/backend/dtos/brand.dto.interface';
import { useUser } from '@/providers/ClientUserProvider';
import Cookies from 'js-cookie';
import { useState } from 'react';

export default function StartPage() {
  const { user } = useUser();
  const [brandData, setBrandData] = useState<IBrandDto>({
    name: '',
    image: '',
    websiteUrl: '',
    description: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBrandData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const token = Cookies.get('Authorization');
    if (token) {
      const createdBrand = await privateBrandsApiWrapper.createBrand(token, brandData);
      if (createdBrand) {
        // Handle successful brand creation (e.g., redirect to dashboard)
        console.log('Brand created successfully:', createdBrand);
        window.location.href = '/admin-shop';
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Bienvenido a la Plataforma FindClo</h1>
      <p className="mb-4">Parece que aún no has creado el perfil de tu marca.</p>
      <p className="mb-6">Comencemos configurando la información de tu marca.</p>
      
      <form onSubmit={handleSubmit} className="max-w-md">
        <div className="mb-4">
          <label htmlFor="name" className="block mb-2">Nombre de la marca</label>
          <input
            type="text"
            id="name"
            name="name"
            value={brandData.name}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="image" className="block mb-2">URL de la imagen</label>
          <input
            type="url"
            id="image"
            name="image"
            value={brandData.image}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="websiteUrl" className="block mb-2">URL del sitio web</label>
          <input
            type="url"
            id="websiteUrl"
            name="websiteUrl"
            value={brandData.websiteUrl}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <Button type="submit">
          Crear tu Marca
        </Button>
      </form>
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">¿Por qué crear un perfil de marca?</h2>
        <ul className="list-disc list-inside">
          <li>Muestra la identidad única de tu marca</li>
          <li>Gestiona tus productos de manera eficiente</li>
          <li>Alcanza más clientes en nuestra plataforma</li>
          <li>Accede a valiosos análisis y estadísticas</li>
        </ul>
      </div>
    </div>
  );
}
