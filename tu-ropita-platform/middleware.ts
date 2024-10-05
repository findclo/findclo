import { privateBrandsApiWrapper } from '@/api-wrappers/brands';
import { privateUsersApiWrapper } from '@/api-wrappers/users';
import { IBrand } from '@/lib/backend/models/interfaces/brand.interface';
import { IUser, UserTypeEnum } from '@/lib/backend/models/interfaces/user.interface';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

async function getUser(accessToken: string): Promise<IUser | null>{
  try{
    const user = await privateUsersApiWrapper.getMe(accessToken);
    return user;
  }catch(err){
    return null;
  }
}

async function getUserBrand(accessToken: string): Promise<IBrand | null>{
  try{
    const brand = await privateBrandsApiWrapper.getMyBrand(accessToken);
    return brand;
  }catch(err){
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('Authorization');

  if (request.nextUrl.pathname === '/' || request.nextUrl.pathname.startsWith('/admin-shop')) {
    if (!authCookie?.value) {
      // No auth cookie, only redirect if not already on the root path
      if (request.nextUrl.pathname !== '/') {
        return NextResponse.redirect(new URL('/', request.url));
      }
      return NextResponse.next();
    }

    const user = await getUser(authCookie.value);
      
    if (!user) {
      // Invalid user, only redirect if not already on the root path
      if (request.nextUrl.pathname !== '/') {
        return NextResponse.redirect(new URL('/', request.url));
      }
      return NextResponse.next();
    }

    // Allow ADMIN users to access any page
    if (user.user_type === UserTypeEnum.ADMIN) {
      return NextResponse.next();
    }

    if (request.nextUrl.pathname === '/') {
      if (user.user_type === UserTypeEnum.BRAND_OWNER) {
        const current_user_brand = await getUserBrand(authCookie.value);
        if (!current_user_brand) {
          return NextResponse.redirect(new URL('/admin-shop/start', request.url));
        } else {
          return NextResponse.redirect(new URL('/admin-shop', request.url));
        }
      }
    } else if (request.nextUrl.pathname.startsWith('/admin-shop')) {
      if (user.user_type !== UserTypeEnum.BRAND_OWNER) {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/admin-shop', '/admin-shop/:path*'],
};