import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
	const res = NextResponse.next();
	const supabase = createMiddlewareClient({ req, res });

	const {
		data: { session }
	} = await supabase.auth.getSession();

	// Check if the session is valid (has a user)
	const isAuthenticated = !!session?.user;

	const protectedRoutes = ['/dashboard', '/properties', '/investments', '/portfolio', '/profile', '/settings', '/security', '/help', '/billing'];
	const authRoutes = ['/auth/login', '/auth/register'];

	const isProtectedRoute = protectedRoutes.some(route =>
		req.nextUrl.pathname.startsWith(route)
	);
	const isAuthRoute = authRoutes.some(route =>
		req.nextUrl.pathname.startsWith(route)
	);

	if (isProtectedRoute && !isAuthenticated) {
		const redirectUrl = new URL('/auth/login', req.url);
		redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname);
		return NextResponse.redirect(redirectUrl);
	}

	if (isAuthRoute && isAuthenticated) {
		let redirectTo = req.nextUrl.searchParams.get('redirectTo') || '/dashboard';

		if (authRoutes.some(route => redirectTo.startsWith(route))) {
			redirectTo = '/dashboard';
		}

		return NextResponse.redirect(new URL(redirectTo, req.url));
	}

	if (req.nextUrl.pathname === '/') {
		if (isAuthenticated) {
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
