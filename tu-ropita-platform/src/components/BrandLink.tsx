import Image from 'next/image';
import Link from 'next/link';

interface BrandLinkProps {
  brandId: string;
  brandName: string;
  brandImage: string;
}

export default function BrandLink({ brandId, brandName, brandImage }: BrandLinkProps) {
  return (
    <Link 
      href={`/brand/${brandId}`} 
      className="flex items-center justify-center bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300 transition-colors"
    >
      <Image
        src={brandImage}
        alt={brandName}
        width={40}
        height={40}
        className="rounded-full mr-2"
      />
      <span>Ver perfil de {brandName}</span>
    </Link>
  );
}