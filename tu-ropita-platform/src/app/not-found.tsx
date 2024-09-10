import '@/app/globals.css'; // Add this line
import { Button } from "@/components/ui/button"
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-600 mb-4">Página no encontrada</h2>
      <p className="text-gray-500 mb-8">Lo sentimos, no pudimos encontrar la página que estás buscando.</p>
      <Button asChild className="mt-4">
        <Link href="/">
          Volver a la página principal
        </Link>
      </Button>
    </div>
  )
}