import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Paths that require authentication
const authRoutes = [
  "/dashboard",
  "/profile",
  "/upload",
  "/watchlater",
  "/history",
];

// Paths that require admin role
const adminRoutes = [
  "/admin",
  "/dashboard/manage",
  "/add-video",
];

// Paths that require premium role
const premiumRoutes = [
  "/premium-content",
];

// Routes that should bypass the database check
const bypassDbCheckRoutes = [
  '/database-error',
  '/api/check-db-status',
  '/_next',
  '/favicon.ico',
  '/images',
];

/**
 * Middleware to manage cookie size and request headers
 * Helps prevent HTTP 431 errors by controlling header size
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Bypass certain routes from all checks
  if (bypassDbCheckRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check cookie size to prevent HTTP 431 errors
  const cookieStr = request.headers.get('cookie') || '';
  const cookieSize = cookieStr.length;
  
  if (cookieSize > 4000) { // 4KB limit
    console.warn(`Large cookie detected: ${cookieSize} bytes - redirecting to error page`);
    return NextResponse.redirect(new URL('/error?code=431&message=Request+header+too+large', request.url));
  }

  // Check if the path requires authentication
  const needsAuth = authRoutes.some(route => pathname.startsWith(route));
  const needsAdmin = adminRoutes.some(route => pathname.startsWith(route));
  const needsPremium = premiumRoutes.some(route => pathname.startsWith(route));

  // Get the token from the session
  try {
    // First check database connection for all routes
    if (!pathname.startsWith('/api/')) {
      const dbCheckResponse = await fetch(new URL('/api/check-db-status', request.url));
      if (!dbCheckResponse.ok) {
        // If not a static asset, redirect to database error page
        if (!pathname.includes('.')) {
          return NextResponse.redirect(new URL('/database-error', request.url));
        }
      }
    }

    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    // Redirect to login if trying to access protected route without being logged in
    if ((needsAuth || needsAdmin || needsPremium) && !token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Redirect non-admin users trying to access admin routes
    if (needsAdmin && token?.role !== "admin") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    // Redirect non-premium users trying to access premium routes
    if (needsPremium && token?.role !== "premium" && token?.role !== "admin") {
      return NextResponse.redirect(new URL("/subscription", request.url));
    }
  } catch (error) {
    // If there's an error during authentication and not on an API route,
    // redirect to database error page as it might be a DB connection issue
    if (!pathname.startsWith('/api/') && !pathname.includes('.')) {
      console.error('Error in middleware:', error);
      return NextResponse.redirect(new URL('/database-error', request.url));
    }
  }

  const response = NextResponse.next();
  
  // Set headers to help manage connection
  response.headers.set('Connection', 'keep-alive');
  
  // Cache management
  const isApiPath = pathname.startsWith('/api/');
  const isDynamicVideoPath = pathname.startsWith('/video/') && pathname.length > 7; // e.g., /video/[id]
  const isAuthPath = pathname === '/login' || pathname === '/signup' || pathname === '/logout';
  const isDashboardPath = pathname.startsWith('/dashboard/');
  
  if (isApiPath) {
    if (pathname.includes('/api/videos') && !pathname.includes('/upload')) {
      // Video listings can be cached briefly
      response.headers.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=60');
    } else {
      // Other API routes - no caching
      response.headers.set('Cache-Control', 'no-store, private');
    }
  } else if (isAuthPath || isDashboardPath || needsAdmin) {
    // Auth and admin pages - no caching
    response.headers.set('Cache-Control', 'no-store, private');
  } else if (isDynamicVideoPath) {
    // Individual video pages - cache for longer with revalidation
    response.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=3600');
  } else {
    // Regular pages - standard caching
    response.headers.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
  }
  
  return response;
}

// Configure paths that should use the middleware
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|images/).*)',
  ],
}; 