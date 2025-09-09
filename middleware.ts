import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const session = req.cookies.get('session')?.value;
  const pathname = req.nextUrl.pathname;
  
  // Si no hay sesión y el usuario intenta acceder a rutas protegidas
  if (!session && (req.nextUrl.pathname.startsWith('/application') || 
                  req.nextUrl.pathname.startsWith('/ordenes-entrega') ||
                  req.nextUrl.pathname.startsWith('/trabajadores') ||
                  req.nextUrl.pathname.startsWith('/traslados') ||
                  req.nextUrl.pathname.startsWith('/unidades')) &&
                  !req.nextUrl.pathname.startsWith('/registro-proveedor')) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
}

export const config = {
  matcher: [
    "/application",
    "/application/:path*",
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
