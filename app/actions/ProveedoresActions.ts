"use server";
import { prisma } from "@/lib/prisma";
import { Proveedor } from "@/types";

export async function getProveedores(): Promise<Proveedor[]> {
  try {
    const proveedores = await prisma.proveedor.findMany({
      select: {
        id: true,
        ruc: true,
        nombre: true,
        telefono: true,
        email: true,
        detalles: true,  // Nuevo campo
        createdAt: true,
        segmentoId: true,
        segmento: true,
        updatedAt: true,
      },
    });

    return proveedores.map((proveedor) => ({
      ...proveedor,
      telefono: proveedor.telefono || undefined,
      email: proveedor.email || undefined,
      detalles: proveedor.detalles || undefined,  // Nuevo campo
      segmentoId: proveedor.segmentoId,
      segmento: {
        id: proveedor.segmentoId,
        nombre: proveedor.segmento?.nombre || "",
        descripcion: proveedor.segmento?.descripcion || "",
        createdAt: new Date(proveedor.segmento?.createdAt || 0).toISOString(),
        updatedAt: new Date(proveedor.segmento?.updatedAt || 0).toISOString(),
      },

      createdAt: new Date(proveedor.createdAt).toISOString(),
      updatedAt: new Date(proveedor.updatedAt).toISOString(),
    }));
  } catch (error) {
    console.error("Error:", error);
    return [];
  }
}

export async function addProveedor(
  proveedor: Omit<Proveedor, "id" | "createdAt" | "updatedAt" | "segmento">
): Promise<Proveedor | null> {
  try {
    const { ruc, nombre, telefono, email, detalles, segmentoId } = proveedor;

    const nuevoProveedor = await prisma.proveedor.create({
      data: {
        ruc,
        nombre,
        telefono: telefono || undefined,
        email: email || undefined,
        detalles: detalles || undefined,  // Nuevo campo
        segmentoId: segmentoId,
      },
      include: {
        segmento: true,
      },
    });

    return {
      ...nuevoProveedor,
      telefono: nuevoProveedor.telefono || undefined,
      email: nuevoProveedor.email || undefined,
      detalles: nuevoProveedor.detalles || undefined,  // Nuevo campo
      segmento: nuevoProveedor.segmento ? {
        id: nuevoProveedor.segmento.id,
        nombre: nuevoProveedor.segmento.nombre,
        descripcion: nuevoProveedor.segmento.descripcion || undefined,
        createdAt: new Date(nuevoProveedor.segmento.createdAt).toISOString(),
        updatedAt: new Date(nuevoProveedor.segmento.updatedAt).toISOString(),
      } : undefined,
      createdAt: new Date(nuevoProveedor.createdAt).toISOString(),
      updatedAt: new Date(nuevoProveedor.updatedAt).toISOString(),
    };
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}

export async function getRucData(rucValue: string) {
  try {
    const apikey = process.env.SUNAT_API_KEY;

    const response = await fetch(
      `https://dniruc.apisperu.com/api/v1/ruc/${rucValue}?token=${apikey}`
    );
    return response.json();
  } catch (error) {
    console.error("Error al obtener datos:", error);
    throw error;
  }
}
