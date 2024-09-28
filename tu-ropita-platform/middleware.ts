import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === '/') {
    const authCookie = request.cookies.get('Authorization');
    const refreshTokenCookie = request.cookies.get('Refresh-Token');

    console.log('Authorization cookie:', authCookie?.value);
    console.log('Refresh-Token cookie:', refreshTokenCookie?.value);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/'],
};