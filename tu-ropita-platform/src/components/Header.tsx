'use client'

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useUser } from '@/providers/ClientUserProvider';
import { Home, LogOut, Menu, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const Header = () => {
  const { user, signOut } = useUser();
  const router = useRouter();

  const handleSignOut = () => {
    const confirmSignOut = window.confirm('¿Estás seguro de que quieres cerrar sesión?');
    if (confirmSignOut) {
      signOut();
    }
  };

  const handleProfileClick = () => {
    router.push('/profile');
  };

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
              <Link href={user ? "/profile" : "/signup"}>{user ? "Perfil" : "Soy una marca"}</Link>
            </Button>
            {user && (
              <>
                <Button onClick={handleProfileClick} size="sm" variant="ghost">
                  <User className="h-5 w-5" />
                </Button>
                <Button onClick={handleSignOut} size="sm" variant="ghost">
                  <LogOut className="h-5 w-5" />
                </Button>
              </>
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
              <Link href={user ? "/profile" : "/signin"}>{user ? "Perfil" : "Soy una marca"}</Link>
            </Button>
            {user && (
              <>
                <Button onClick={handleProfileClick} variant="ghost">
                  <User className="h-5 w-5" />
                </Button>
                <Button onClick={handleSignOut} variant="ghost">
                  <LogOut className="h-5 w-5" />
                </Button>
              </>
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
                <Link href={user ? "/profile" : "/signin"}>{user ? "Perfil" : "Soy una marca"}</Link>
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
          <Button onClick={handleProfileClick} variant="ghost" className="flex flex-col items-center">
            <User className="h-6 w-6" />
            <span className="text-xs mt-1">{user ? "Perfil" : "Soy una marca"}</span>
          </Button>
          {user && (
            <Button onClick={handleSignOut} variant="ghost" className="flex flex-col items-center">
              <LogOut className="h-6 w-6" />
              <span className="text-xs mt-1">Salir</span>
            </Button>
          )}
        </div>
      </nav>
    </>
  );
};

export default Header;