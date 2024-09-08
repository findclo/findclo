import { IProduct } from "@/lib/backend/models/interfaces/product.interface";
import Image from 'next/image';
import Link from 'next/link';

interface ProductCardProps {
  product: IProduct;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/product/${product.id}`} className="group">
      <div className={`border rounded-lg overflow-hidden transition-all duration-300 group-hover:shadow-lg`}>
        <Image
          src={product.images[0]}
          alt={product.name}
          width={300}
          height={300}
          className="w-full h-48 object-cover"
        />
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
          <p className="text-gray-600">${product.price.toFixed(2)}</p>
        </div>
      </div>
    </Link>
  );
}