"use server";

import { cookies } from "next/headers";

export async function saveSession(user: { id: string; nombre: string }) {
  const sessionData = JSON.stringify({
    id: user.id,
    nombre: user.nombre,
  });

  // cookies() retorna una promesa en esta versión
  const cookieStore = await cookies();
  cookieStore.set("mi_sesion", sessionData, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

// Función para obtener y validar la sesión desde la cookie
export async function getSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("mi_sesion");
  if (!sessionCookie) return null;
  try {
    return JSON.parse(sessionCookie.value);
  } catch {
    return null;
  }
}
