import { privateBrandsApiWrapper } from '@/api-wrappers/brands';
import { privateUsersApiWrapper } from '@/api-wrappers/users';
import { IBrand } from '@/lib/backend/models/interfaces/brand.interface';
import { IUser, UserTypeEnum } from '@/lib/backend/models/interfaces/user.interface';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

async function getUser(accessToken: string): Promise<IUser | null> {
  try {
    return await privateUsersApiWrapper.getMe(accessToken);
  } catch (err) {
    return null;
  }
}

async function getUserBrand(accessToken: string): Promise<IBrand | null> {
  try {
    return await privateBrandsApiWrapper.getMyBrand(accessToken);
  } catch (err) {
    return null;
  }
}

const publicRoutes = ['/', '/signin', '/signup', '/product', '/brand', '/search'];
const adminRoutes = ['/admin', '/admin-shop'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authCookie = request.cookies.get('Authorization');

  // Handle public routes
  // if (publicRoutes.some(route => pathname.startsWith(route))) {
  //   return NextResponse.next();
  // }

  // Handle unauthenticated users
  if (!authCookie?.value) {
    if (adminRoutes.some(route => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL('/signin', request.url));
    }
    if (publicRoutes.some(route => pathname.startsWith(route))) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/', request.url));
  }

  const user = await getUser(authCookie.value);

  // Handle invalid users
  if (!user) {
    const response = NextResponse.redirect(new URL('/signin', request.url));
    response.cookies.delete('Authorization');
    response.cookies.delete('Refresh-Token');
    return response;
  }

  switch (user.user_type) {
    case UserTypeEnum.BRAND_OWNER:
      return handleBrandOwner(authCookie.value, pathname, request);
    case UserTypeEnum.ADMIN:
      return handleAdmin(pathname, request);
    default:
      return NextResponse.redirect(new URL('/', request.url));
  }
}

async function handleBrandOwner(accessToken: string, pathname: string, request: NextRequest) {
  const brand = await getUserBrand(accessToken);
  
  if (brand) {
    if (pathname.startsWith('/admin-shop')) {
      return NextResponse.next();
    } else {
      return NextResponse.redirect(new URL('/admin-shop', request.url));
    }
  } else {
    if (pathname === '/admin-shop/start') {
      return NextResponse.next();
    } else {
      return NextResponse.redirect(new URL('/admin-shop/start', request.url));
    }
  }
}

function handleAdmin(pathname: string, request: NextRequest) {
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin-shop')) {
    return NextResponse.next();
  } else {
    return NextResponse.redirect(new URL('/admin', request.url));
  }
}

export const config = {
  matcher: [
    '/',
    '/profile',
    '/signin',
    '/signup',
    '/product/:path*',
    '/brand/:path*',
    '/search/:path*',
    '/admin/:path*',
    '/admin-shop/:path*'
  ],
};