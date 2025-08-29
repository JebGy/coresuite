"use server";

import { prisma } from "@/lib/prisma";
import { ApiResponse, Almacen } from "@/types";
import { registrarLog } from "@/lib/logger";

export async function addAlmacen(almacen: Omit<Almacen, 'id'>, usuarioId: number) {
  const nuevoAlmacen = await prisma.almacen.create({
    data: {
      nombre: almacen.nombre,
      ubicacion: almacen.ubicacion,
      descripcion: almacen.descripcion,
    },
  });
  await registrarLog({
    usuarioId: usuarioId,
    accion: "CREAR",
    entidad: "Almacen",
    entidadId: nuevoAlmacen.id,
    detalles: `Almacén creado: ${nuevoAlmacen.nombre}`,
  });
  console.log("Almacén agregado");
}

export async function getAlmacenes(): Promise<ApiResponse<Almacen[]>> {
  try {
    const almacenes = await prisma.almacen.findMany();
    // Convertir null a undefined en campos opcionales para cumplir con el tipo Almacen
    const formattedAlmacenes = almacenes.map((a) => ({
      ...a,
      ubicacion: a.ubicacion === null ? undefined : a.ubicacion,
      descripcion: a.descripcion === null ? undefined : a.descripcion,
      unidadId: a.unidadId === null ? undefined : a.unidadId,
    }));
    
    return {
      success: true,
      data: formattedAlmacenes
    };
  } catch (error) {
    console.error('Error al obtener almacenes:', error);
    return {
      success: false,
      error: 'Error al obtener los almacenes'
    };
  }
}

export async function deleteAlmacen(id: number, usuarioId: number) {
  await prisma.almacen.delete({
    where: { id },
  });
  await registrarLog({
    usuarioId: usuarioId,
    accion: "ELIMINAR",
    entidad: "Almacen",
    entidadId: id,
    detalles: `Almacén eliminado`,
  });
  console.log("Almacén eliminado");
}

export async function updateAlmacen(id: number, almacen: Partial<Almacen>, usuarioId: number) {
  await prisma.almacen.update({
    where: { id },
    data: {
      nombre: almacen.nombre,
      ubicacion: almacen.ubicacion,
      descripcion: almacen.descripcion,
    },
  });
  await registrarLog({
    usuarioId: usuarioId,
    accion: "ACTUALIZAR",
    entidad: "Almacen",
    entidadId: id,
    detalles: `Almacén actualizado`,
  });
  console.log("Almacén actualizado");
} 