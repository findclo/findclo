import { IProduct } from "@/lib/backend/models/interfaces/product.interface";
import ProductCard from './ProductCard'; // Add this import

interface SearchResultsProps {
  products: IProduct[];
}

export default function SearchResults({ products }: SearchResultsProps) {
  return (
    <>
      <h1 className="text-xl mb-6">Resultados de búsqueda:</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </>
  );
}