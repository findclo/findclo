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
      <h1 className="text-2xl font-bold mb-6">Shop Profile</h1>
      <div className="flex justify-center items-center">
        <Card className="w-full max-w-2xl">
          <CardContent>
            {isEditing ? (
              <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={editedBrand?.name || ''}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image">Image URL</Label>
                  <Input
                    id="image"
                    name="image"
                    value={editedBrand?.image || ''}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="websiteUrl">Website URL</Label>
                  <Input
                    id="websiteUrl"
                    name="websiteUrl"
                    value={editedBrand?.websiteUrl || ''}
                    onChange={handleChange}
                  />
                </div>
                {/* Add more form fields for other brand properties */}
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                  <Button type="submit">Save</Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 text-center">
                <div className="flex justify-center">
                  <Image
                    src={brand.image || '/placeholder-image.jpg'}
                    alt={brand.name}
                    width={200}
                    height={200}
                    className="rounded-full mt-4"
                  />
                </div>
                <p><strong>Name:</strong> {brand.name}</p>
                <p><strong>Website:</strong> <a href={brand.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{brand.websiteUrl}</a></p>
                {/* Display other brand properties */}
                <Button onClick={handleEdit}>Edit Profile</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
