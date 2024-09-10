import { IProduct } from "@/lib/backend/models/interfaces/product.interface";
import Image from 'next/image';
import Link from 'next/link';

interface ProductCardProps {
  product: IProduct;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/product/${product.id}`} className="group block">
      <div className="flex flex-col h-full transition-transform duration-300 ease-in-out transform hover:scale-102 hover:shadow-md">
        {/* Image container with reduced zoom effect */}
        <div className="relative aspect-square overflow-hidden mb-2">
          <Image
            src={product.images[0]}
            alt={product.name}
            layout="fill"
            objectFit="cover"
            className="transition-transform duration-300 ease-in-out transform group-hover:scale-105"
          />
        </div>
        {/* Text content */}
        <div className="flex-grow p-2">
          <h3 className="font-medium text-sm mb-1">{product.name}</h3>
          <p className="text-xs text-gray-600 mb-1">{product.description}</p>
          <p className="font-semibold text-sm">$ {product.price.toFixed(2)}</p>
        </div>
      </div>
    </Link>
  );
}