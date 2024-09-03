import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

interface Brand {
  src: string;
  alt: string;
}

const brands: Brand[] = [
  { src: "https://1000logos.net/wp-content/uploads/2021/11/Nike-Logo.png", alt: "Nike logo" },
  { src: "https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg", alt: "Adidas logo" },
  { src: "https://1000logos.net/wp-content/uploads/2017/05/Zara-logo.png", alt: "Zara logo" },
  { src: "https://1000logos.net/wp-content/uploads/2017/02/HM-Logo.png", alt: "H&M logo" },
  { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/1960s_Gucci_Logo.svg/2560px-1960s_Gucci_Logo.svg.png", alt: "Gucci logo" },
];

export function FeaturedBrands() {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Marcas destacadas</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {brands.map((brand, index) => (
          <Card key={index} className="flex items-center justify-center">
            <CardContent className="p-6">
              <Image src={brand.src} alt={brand.alt} width={150} height={150} objectFit="contain" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}