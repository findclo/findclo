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
  if (request.nextUrl.pathname === '/') {
    const authCookie = request.cookies.get('Authorization');
    const refreshTokenCookie = request.cookies.get('Refresh-Token');

    if (authCookie?.value) {

      const user = await getUser(authCookie.value);
      if(user?.user_type === UserTypeEnum.BRAND_OWNER){
        const current_user_brand = await getUserBrand(authCookie.value);
        if (!current_user_brand) {
          return NextResponse.redirect(new URL('/admin-shop/start', request.url));
        }else{
          return NextResponse.redirect(new URL('/admin-shop', request.url));
        }
      }else{
        //TODO: this means it is type ADMIN, redirect to /admin
      }

    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/'],
};