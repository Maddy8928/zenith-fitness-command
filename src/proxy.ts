import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
    // Try to parse the pseudo-auth cookie or local storage equivalent 
    // Note: Middleware can only read cookies. Since we used localStorage for the mock,
    // we cannot easily intercept via Edge Middleware alone without saving a cookie.

    // To make this fully functional with just middleware, we would need to store auth state in a cookie.
    // We will pass through for now and rely on the client-side role checks for the static mock implementation.
    // In a real application, you would decode the JWT JWT cookie here:

    /*
    const token = request.cookies.get('zenith_auth_token');
    
    if (!token && request.nextUrl.pathname.startsWith('/admin')) {
        return NextResponse.redirect(new URL('/login', request.url));
    }
    */

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/admin/:path*',
        '/trainer/:path*',
        '/member/:path*',
        '/receptionist/:path*'
    ],
};
