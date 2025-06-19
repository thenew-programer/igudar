import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
	// Early return for API routes, static files, and auth endpoints
	const { pathname } = req.nextUrl;

	// Skip middleware entirely for these paths
	if (
		pathname.startsWith('/api/') ||
		pathname.startsWith('/_next/') ||
		pathname.startsWith('/favicon.ico') ||
		pathname.includes('.')  // Skip files with extensions
	) {
		return NextResponse.next();
	}

	try {
		const res = NextResponse.next();
		const supabase = createMiddlewareClient({ req, res });

		// Use getUser() instead of getSession() for more reliable auth checking
		const {
			data: { user },
			error
		} = await supabase.auth.getUser();

		// If there's an auth error, treat as unauthenticated
		const isAuthenticated = !error && !!user;

		const protectedRoutes = [
			'/dashboard',
			'/properties',
			'/investments',
			'/portfolio',
			'/profile',
			'/settings',
			'/security',
			'/help',
			'/billing'
		];
		const authRoutes = ['/auth/login', '/auth/register'];

		const isProtectedRoute = protectedRoutes.some(route =>
			pathname.startsWith(route)
		);
		const isAuthRoute = authRoutes.some(route =>
			pathname.startsWith(route)
		);

		// Handle protected routes
		if (isProtectedRoute && !isAuthenticated) {
			const redirectUrl = new URL('/auth/login', req.url);
			redirectUrl.searchParams.set('redirectTo', pathname);
			return NextResponse.redirect(redirectUrl);
		}

		// Handle auth routes when already authenticated
		if (isAuthRoute && isAuthenticated) {
			let redirectTo = req.nextUrl.searchParams.get('redirectTo') || '/dashboard';

			// Prevent redirect loops - don't redirect to auth routes
			if (authRoutes.some(route => redirectTo.startsWith(route))) {
				redirectTo = '/dashboard';
			}

			return NextResponse.redirect(new URL(redirectTo, req.url));
		}

		// Handle root path
		if (pathname === '/') {
			if (isAuthenticated) {
				return NextResponse.redirect(new URL('/dashboard', req.url));
			} else {
				return NextResponse.redirect(new URL('/auth/login', req.url));
			}
		}

		return res;

	} catch (error) {
		console.error('Auth middleware error:', error);

		// More conservative error handling - only redirect if we're certain it's an auth issue
		// and not on an auth page already
		if (!pathname.startsWith('/auth/')) {
			const protectedRoutes = [
				'/dashboard',
				'/properties',
				'/investments',
				'/portfolio',
				'/profile',
				'/settings',
				'/security',
				'/help',
				'/billing'
			];

			const isProtectedRoute = protectedRoutes.some(route =>
				pathname.startsWith(route)
			);

			// Only redirect to login if we're on a protected route
			if (isProtectedRoute) {
				const redirectUrl = new URL('/auth/login', req.url);
				redirectUrl.searchParams.set('redirectTo', pathname);
				return NextResponse.redirect(redirectUrl);
			}
		}

		// For non-protected routes or if already on auth page, just continue
		return NextResponse.next();
	}
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * - All files with extensions (images, etc.)
		 */
		'/((?!api|_next/static|_next/image|favicon.ico|.*\\.[\\w]+$).*)',
	],
};
