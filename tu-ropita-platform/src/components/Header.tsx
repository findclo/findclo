'use client'

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { IUser, UserTypeEnum } from '@/lib/backend/models/interfaces/user.interface';
import { cn } from "@/lib/utils"; // Make sure you have this utility function
import { useUser } from '@/providers/ClientUserProvider';
import { BarChart, CreditCard, Home, LogOut, Menu, Package, ShoppingBag, Store, User, Layers, Tags } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { CategoryMegaMenu } from './CategoryMegaMenu';

const Header = () => {
  const { user, signOut } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get categoryId from URL for highlighting active category
  const activeCategoryId = searchParams.get('categoryId')
    ? parseInt(searchParams.get('categoryId')!, 10)
    : null;

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
        { label: 'Categorías', href: '/admin-shop/categories', icon: Layers },
        { label: 'Perfil', href: '/admin-shop/profile', icon: User },
        { label: 'Estadísticas', href: '/admin-shop/stats', icon: BarChart },
        { label: 'Facturación', href: '/admin-shop/billing', icon: CreditCard },
      ];
    }
    
    if (user.user_type === UserTypeEnum.ADMIN) {
      return [
        { label: 'Comercios', href: '/admin', icon: Store },
        { label: 'Categorías', href: '/admin/categories', icon: Layers },
        { label: 'Atributos', href: '/admin/attributes', icon: Tags },
        { label: 'Estadísticas', href: '/admin/stats', icon: BarChart },
        { label: 'Facturación', href: '/admin/billing', icon: CreditCard },
      ];
    }
    
    return [{ label: 'Inicio', href: '/', icon: Home }];
  };

  const menuItems = getMenuItems(user);

  return (
    <>
      {/* Top header for mobile */}
      <header className="border-b md:hidden fixed top-0 left-0 right-0 bg-white z-50">
        <div className="container flex h-12 items-center justify-between relative">
          {/* Left: Category Menu */}
          <div className="flex-shrink-0">
            <CategoryMegaMenu activeCategoryId={activeCategoryId} inline={true} />
          </div>

          {/* Center: Logo */}
          <Link href="/" className="absolute left-1/2 transform -translate-x-1/2 flex items-center">
            <Image
              src="/logo.webp"
              alt="FindClo Logo"
              width={80}
              height={26}
              className="h-6 w-auto object-contain"
              priority
              unoptimized
              style={{ minWidth: '80px' }}
            />
          </Link>

          {/* Right: Menu hamburger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="flex-shrink-0">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col gap-4">
                {menuItems.map((item, index) => (
                  <Link
                    key={index}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 py-2",
                      pathname === item.href && "font-bold border-b-2 border-details"
                    )}
                  >
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
      <header className="border-b hidden md:block sticky top-0 z-50 bg-white">
        <div className="container flex h-16 items-center justify-between relative">
          {/* Left: Category Menu */}
          <div className="flex-shrink-0">
            <CategoryMegaMenu activeCategoryId={activeCategoryId} inline={true} />
          </div>

          {/* Center: Logo */}
          <Link href="/" className="absolute left-1/2 transform -translate-x-1/2 flex items-center">
            <Image
              src="/logo.webp"
              alt="FindClo Logo"
              width={120}
              height={40}
              className="h-10 w-auto object-contain"
              priority
              unoptimized
              style={{ minWidth: '120px' }}
            />
          </Link>

          {/* Right: Navigation */}
          <nav className="flex items-center gap-4 flex-shrink-0">
            {menuItems.map((item, index) => (
              <Button
                key={index}
                asChild
                variant="ghost"
                className={cn(
                  pathname === item.href && "font-bold border-b-2 border-details"
                )}
              >
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