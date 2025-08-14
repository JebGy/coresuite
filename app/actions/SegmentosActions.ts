"use server";
import { prisma } from "@/lib/prisma";
import { Segmento } from "@/types";

export async function getSegmentos(): Promise<Segmento[]> {
  try {
    const segmentos = await prisma.segmento.findMany({
      orderBy: {
        nombre: "asc",
      },
    });

    return segmentos.map((segmento) => ({
      ...segmento,
      descripcion: segmento.descripcion || undefined,
      createdAt: new Date(segmento.createdAt).toISOString(),
      updatedAt: new Date(segmento.updatedAt).toISOString(),
    }));
  } catch (error) {
    console.error("Error al obtener segmentos:", error);
    return [];
  }
}

export async function addSegmento(
  segmento: Omit<Segmento, "id" | "createdAt" | "updatedAt">
): Promise<Segmento | null> {
  try {
    const { nombre, descripcion } = segmento;

    const nuevoSegmento = await prisma.segmento.create({
      data: {
        nombre,
        descripcion: descripcion || undefined,
      },
    });

    return {
      ...nuevoSegmento,
      descripcion: nuevoSegmento.descripcion || undefined,
      createdAt: new Date(nuevoSegmento.createdAt).toISOString(),
      updatedAt: new Date(nuevoSegmento.updatedAt).toISOString(),
    };
  } catch (error) {
    console.error("Error al crear segmento:", error);
    return null;
  }
}

export async function updateSegmento(
  id: number,
  segmento: Partial<Omit<Segmento, "id" | "createdAt" | "updatedAt">>
): Promise<Segmento | null> {
  try {
    const segmentoActualizado = await prisma.segmento.update({
      where: { id },
      data: {
        nombre: segmento.nombre,
        descripcion: segmento.descripcion || undefined,
      },
    });

    return {
      ...segmentoActualizado,
      descripcion: segmentoActualizado.descripcion || undefined,
      createdAt: new Date(segmentoActualizado.createdAt).toISOString(),
      updatedAt: new Date(segmentoActualizado.updatedAt).toISOString(),
    };
  } catch (error) {
    console.error("Error al actualizar segmento:", error);
    return null;
  }
}

export async function deleteSegmento(id: number): Promise<boolean> {
  try {
    // Verificar si hay proveedores asociados a este segmento
    const proveedoresAsociados = await prisma.proveedor.count({
      where: { segmentoId: id },
    });

    if (proveedoresAsociados > 0) {
      throw new Error("No se puede eliminar el segmento porque tiene proveedores asociados");
    }

    await prisma.segmento.delete({
      where: { id },
    });

    return true;
  } catch (error) {
    console.error("Error al eliminar segmento:", error);
    return false;
  }
}