import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const session = req.cookies.get("session")?.value;
  const pathname = req.nextUrl.pathname;

  // Debug logs para diagnosticar el problema
  console.log('🔍 Middleware Debug:');
  console.log('- Pathname:', pathname);
  console.log('- Session cookie:', session ? 'EXISTS' : 'NOT FOUND');
  console.log('- Session value:', session);

  // Rutas públicas que no requieren autenticación
  const publicRoutes = ["/", "/login", "/registro-proveedor"];
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + "/")
  );

  // Rutas protegidas que requieren autenticación
  const protectedRoutes = [
    "/application",
    "/ordenes-entrega",
    "/trabajadores",
    "/traslados",
    "/unidades",
    "/boletas",
    "/cotizaciones",
    "/logs",
    "/recursoshumanos",
    "/solicitudes",
    "/valorizado"
  ];
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );

  console.log('- Is public route:', isPublicRoute);
  console.log('- Is protected route:', isProtectedRoute);

  // Si es una ruta pública, permitir acceso
  if (isPublicRoute) {
    console.log('✅ Allowing access to public route');
    return NextResponse.next();
  }

  // Si es una ruta protegida y no hay sesión, redirigir al login
  if (isProtectedRoute && !session) {
    console.log('🚫 Redirecting to login - protected route without session');
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Si hay sesión o no es una ruta específicamente manejada, permitir acceso
  console.log('✅ Allowing access - session exists or unhandled route');
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/registro-proveedor/:path*",
    "/application/:path*",
    "/ordenes-entrega/:path*",
    "/trabajadores/:path*",
    "/traslados/:path*",
    "/unidades/:path*",
    "/boletas/:path*",
    "/cotizaciones/:path*",
    "/logs/:path*",
    "/recursoshumanos/:path*",
    "/solicitudes/:path*",
    "/valorizado/:path*",
  ],
};
