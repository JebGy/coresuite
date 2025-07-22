"use server";

import { prisma } from "@/lib/prisma";
import { Unidad } from "@/types";
import { registrarLog } from "@/lib/logger";

export async function getUnidades(): Promise<Unidad[]> {
  try {
    const unidades = await prisma.unidad.findMany({
      orderBy: {
        nombre: "asc",
      },
    });

    return unidades as Unidad[];
  } catch (error) {
    console.error("Error al obtener unidades:", error);
    throw new Error("Error al obtener unidades");
  }
}

export async function createUnidad(
  data: {
    nombre: string;
    descripcion?: string;
  },
  usuarioId?: number
): Promise<Unidad> {
  try {
    const unidad = await prisma.unidad.create({
      data,
    });
    await registrarLog({
      usuarioId: usuarioId,
      accion: "CREAR",
      entidad: "Unidad",
      entidadId: unidad.id,
      detalles: `Unidad creada: ${unidad.nombre}`,
    });

    return unidad as Unidad;
  } catch (error) {
    console.error("Error al crear unidad:", error);
    throw new Error("Error al crear unidad");
  }
}

export async function updateUnidad(
  id: number,
  data: {
    nombre?: string;
    descripcion?: string;
  },
  usuarioId?: number
): Promise<Unidad> {
  try {
    const unidad = await prisma.unidad.update({
      where: { id },
      data,
    });
    await registrarLog({
      usuarioId: usuarioId,
      accion: "ACTUALIZAR",
      entidad: "Unidad",
      entidadId: id,
      detalles: `Unidad actualizada`,
    });

    return unidad as Unidad;
  } catch (error) {
    console.error("Error al actualizar unidad:", error);
    throw new Error("Error al actualizar unidad");
  }
}

export async function deleteUnidad(
  id: number,
  usuarioId?: number
): Promise<void> {
  try {
    await prisma.unidad.delete({
      where: { id },
    });
    await registrarLog({
      usuarioId: usuarioId,
      accion: "ELIMINAR",
      entidad: "Unidad",
      entidadId: id,
      detalles: `Unidad eliminada`,
    });
  } catch (error) {
    console.error("Error al eliminar unidad:", error);
    throw new Error("Error al eliminar unidad");
  }
}

export async function getUnidadById(id: number): Promise<Unidad | null> {
  try {
    const unidad = await prisma.unidad.findUnique({
      where: { id },
    });

    return unidad as Unidad;
  } catch (error) {
    console.error("Error al obtener unidad:", error);
    throw new Error("Error al obtener unidad");
  }
}
