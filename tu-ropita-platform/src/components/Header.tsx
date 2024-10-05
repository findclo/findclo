'use client'

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { IUser, UserTypeEnum } from '@/lib/backend/models/interfaces/user.interface';
import { cn } from "@/lib/utils"; // Make sure you have this utility function
import { useUser } from '@/providers/ClientUserProvider';
import { BarChart, CreditCard, Home, LogOut, Menu, Package, ShoppingBag, Store, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const Header = () => {
  const { user, signOut } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = () => {
    const confirmSignOut = window.confirm('¿Estás seguro de que quieres cerrar sesión?');
    if (confirmSignOut) {
      signOut();
    }
  };

  const handleProfileClick = () => {
    router.push('/profile');
  };

  console.log(user);
  const getMenuItems = (user: IUser | null) => {
    if (!user) return [
      { label: 'Inicio', href: '/', icon: Home },
      { label: 'Soy Comerciante', href: '/signin', icon: ShoppingBag }
    ];
    
    if (user.user_type === UserTypeEnum.BRAND_OWNER) {
      return [
        { label: 'Productos', href: '/admin-shop/products', icon: Package },
        { label: 'Perfil', href: '/profile', icon: User },
        { label: 'Estadísticas', href: '/admin-shop/stats', icon: BarChart },
        { label: 'Facturación', href: '/admin-shop/billing', icon: CreditCard },
      ];
    }
    
    if (user.user_type === UserTypeEnum.ADMIN) {
      return [
        { label: 'Comercios', href: '/admin/stores', icon: Store },
        { label: 'Estadísticas', href: '/admin/stats', icon: BarChart },
        { label: 'Facturación', href: '/admin/billing', icon: CreditCard },
      ];
    }
    
    return [{ label: 'Inicio', href: '/', icon: Home }];
  };

  const menuItems = getMenuItems(user);
  console.log(menuItems);

  return (
    <>
      {/* Top header for mobile */}
      <header className="border-b md:hidden fixed top-0 left-0 right-0 bg-white z-50">
        <div className="container flex h-12 items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            FindClo
          </Link>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col gap-4">
                {menuItems.map((item, index) => (
                  <Link key={index} href={item.href} className="flex items-center gap-2 py-2">
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                ))}
                {user && (
                  <>
                    <div className="border-t my-2"></div>
                    <Button 
                      onClick={handleSignOut} 
                      variant="outline" 
                      className={cn(
                        "w-full justify-start",
                        "border-red-500 text-red-500 hover:bg-red-50",
                        "focus:ring-red-500"
                      )}
                    >
                      <LogOut className="h-5 w-5 mr-2" />
                      Salir
                    </Button>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
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
          <nav className="flex items-center gap-4">
            {menuItems.map((item, index) => (
              <Button key={index} asChild variant="ghost">
                <Link href={item.href} className="flex items-center gap-2">
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              </Button>
            ))}
            {user && (
              <Button 
                onClick={handleSignOut} 
                variant="outline" 
                className={cn(
                  "border-red-500 text-red-500 hover:bg-red-50",
                  "focus:ring-red-500"
                )}
              >
                <LogOut className="h-5 w-5 mr-2" />
                Salir
              </Button>
            )}
          </nav>
        </div>
      </header>

      {/* Remove bottom navigation for mobile */}
    </>
  );
};

export default Header;