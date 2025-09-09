import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const session = req.cookies.get('session')?.value;
  const pathname = req.nextUrl.pathname;
  
  // Rutas que no requieren autenticación
  if (pathname.startsWith('/registro-proveedor') || 
      pathname.startsWith('/login') ||
      pathname === '/') {
    return NextResponse.next();
  }
  
  // Si no hay sesión y el usuario intenta acceder a rutas protegidas
  if (!session && (pathname.startsWith('/application') || 
                  pathname.startsWith('/ordenes-entrega') ||
                  pathname.startsWith('/trabajadores') ||
                  pathname.startsWith('/traslados') ||
                  pathname.startsWith('/unidades') ||
                  pathname.startsWith('/boletas') ||
                  pathname.startsWith('/cotizaciones') ||
                  pathname.startsWith('/logs') ||
                  pathname.startsWith('/recursoshumanos') ||
                  pathname.startsWith('/solicitudes') ||
                  pathname.startsWith('/valorizado'))) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/application",
    "/application/:path*",
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
