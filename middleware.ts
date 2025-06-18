import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
	const res = NextResponse.next();
	const supabase = createMiddlewareClient({ req, res });

	// Refresh session if expired - required for Server Components
	const {
		data: { session },
	} = await supabase.auth.getSession();

	// Protected routes that require authentication
	const protectedRoutes = ['/dashboard', '/properties', '/investments', '/portfolio', '/profile', '/settings', '/security', '/help', '/billing'];
	const authRoutes = ['/auth/login', '/auth/register'];

	const isProtectedRoute = protectedRoutes.some(route =>
		req.nextUrl.pathname.startsWith(route)
	);
	const isAuthRoute = authRoutes.some(route =>
		req.nextUrl.pathname.startsWith(route)
	);

	// Redirect unauthenticated users from protected routes to login
	if (isProtectedRoute && !session) {
		const redirectUrl = new URL('/auth/login', req.url);
		redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname);
		return NextResponse.redirect(redirectUrl);
	}

	// Redirect authenticated users from auth routes to dashboard
	if (isAuthRoute && session) {
		let redirectTo = req.nextUrl.searchParams.get('redirectTo') || '/dashboard';

		// Prevent redirect loop: if redirectTo is an auth route, use dashboard instead
		if (authRoutes.some(route => redirectTo.startsWith(route))) {
			redirectTo = '/dashboard';
		}

		return NextResponse.redirect(new URL(redirectTo, req.url));
	}

	// Handle root path redirect
	if (req.nextUrl.pathname === '/') {
		if (session) {
			return NextResponse.redirect(new URL('/dashboard', req.url));
		} else {
			return NextResponse.redirect(new URL('/auth/login', req.url));
		}
	}

	return res;
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * - public folder
		 */
		'/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
	],
};
