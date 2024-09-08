import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";

interface Brand {
  src: string;
  alt: string;
  href: string;
}

const brands: Brand[] = [
  { src: "https://1000logos.net/wp-content/uploads/2021/11/Nike-Logo.png", alt: "Nike logo", href: "/brand/3" },
  { src: "https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg", alt: "Adidas logo", href: "/brand/2" },
  { src: "https://1000logos.net/wp-content/uploads/2017/05/Zara-logo.png", alt: "Zara logo", href: "/brand/1" },
  { src: "https://1000logos.net/wp-content/uploads/2017/02/HM-Logo.png", alt: "H&M logo", href: "/brands/hm" },
  { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/1960s_Gucci_Logo.svg/2560px-1960s_Gucci_Logo.svg.png", alt: "Gucci logo", href: "/brands/gucci" },
];

export function FeaturedBrands() {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Marcas destacadas</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {brands.map((brand, index) => (
          <Link key={index} href={brand.href}>
            <Card className="flex items-center justify-center transition-transform duration-300 hover:scale-105 cursor-pointer h-40 w-full">
              <CardContent className="p-4 flex items-center justify-center w-full h-full">
                <Image src={brand.src} alt={brand.alt} width={120} height={120} objectFit="contain" className="max-w-full max-h-full" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}