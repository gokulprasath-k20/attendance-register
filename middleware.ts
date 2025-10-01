import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Check role-based access
    if (path.startsWith('/admin') && token?.role !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url));
    }

    if (path.startsWith('/staff') && token?.role !== 'staff') {
      return NextResponse.redirect(new URL('/', req.url));
    }

    if (path.startsWith('/student') && token?.role !== 'student') {
      return NextResponse.redirect(new URL('/', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ['/admin/:path*', '/staff/:path*', '/student/:path*'],
};
