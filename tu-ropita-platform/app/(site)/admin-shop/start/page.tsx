import Link from 'next/link';

export default function StartPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Bienvenido a la Plataforma FindClo</h1>
      <p className="mb-4">Parece que aún no has creado el perfil de tu marca.</p>
      <p className="mb-6">Comencemos configurando la información de tu marca.</p>
      
      <Link href="/admin-shop/create-brand" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
        Crear tu Marca
      </Link>
      
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
