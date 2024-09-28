import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Home, Menu, User } from 'lucide-react';
import Link from 'next/link';

// Add user prop
const Header = ({ user }: { user?: { name: string } }) => {
  return (
    <>
      {/* Top header for mobile */}
      <header className="border-b md:hidden fixed top-0 left-0 right-0 bg-white z-50">
        <div className="container flex h-12 items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            FindClo
          </Link>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/signup">Soy una marca</Link>
            </Button>
            {user && (
              <Link href="/profile">
                <User className="h-5 w-5" />
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Spacer div to prevent content from being hidden under the mobile header */}
      <div className="h-12 md:hidden"></div>

      {/* Existing header for desktop */}
      <header className="border-b hidden md:block">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            FindClo
          </Link>
          <nav className="hidden md:flex items-center gap-4">
            <Button asChild>
              <Link href="/">Inicio</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/signin">Soy una marca</Link>
            </Button>
            {user && (
              <Link href="/profile">
                <User className="h-5 w-5" />
              </Link>
            )}
          </nav>
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col gap-4">
                <Link href="/">Inicio</Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Bottom navigation for mobile */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t md:hidden shadow-2xl z-50">
        
        <div className="flex justify-around items-center h-16">
          <Link href="/" className="flex flex-col items-center">
            <Home className="h-6 w-6" />
            <span className="text-xs mt-1">Inicio</span>
          </Link>
          <Link href="/signup" className="flex flex-col items-center">
            <User className="h-6 w-6" />
            <span className="text-xs mt-1">Soy una marca</span>
          </Link>
          {/* <Link href="/search?q=summer" className="flex flex-col items-center">
            <Search className="h-6 w-6" />
            <span className="text-xs mt-1">Buscar</span>
          </Link> */}
          {/* <Link href="/cart" className="flex flex-col items-center">
            <ShoppingBag className="h-6 w-6" />
            <span className="text-xs mt-1">Carrito</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center">
            <User className="h-6 w-6" />
            <span className="text-xs mt-1">Perfil</span>
          </Link> */}
        </div>
      </nav>

    </>
  );
};

export default Header;