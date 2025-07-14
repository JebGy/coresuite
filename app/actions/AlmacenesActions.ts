"use server";

import { prisma } from "@/lib/prisma";
import { Almacen } from "@/types";

export async function addAlmacen(almacen: Omit<Almacen, 'id'>) {
  await prisma.almacen.create({
    data: {
      nombre: almacen.nombre,
      ubicacion: almacen.ubicacion,
      descripcion: almacen.descripcion,
    },
  });
  console.log("Almacén agregado");
}

export async function getAlmacenes(): Promise<Almacen[]> {
  const almacenes = await prisma.almacen.findMany();
  // Convertir null a undefined en campos opcionales para cumplir con el tipo Almacen
  return almacenes.map((a) => ({
    ...a,
    ubicacion: a.ubicacion === null ? undefined : a.ubicacion,
    descripcion: a.descripcion === null ? undefined : a.descripcion,
  }));
}

export async function deleteAlmacen(id: number) {
  await prisma.almacen.delete({
    where: { id },
  });
  console.log("Almacén eliminado");
}

export async function updateAlmacen(id: number, almacen: Partial<Almacen>) {
  await prisma.almacen.update({
    where: { id },
    data: {
      nombre: almacen.nombre,
      ubicacion: almacen.ubicacion,
      descripcion: almacen.descripcion,
    },
  });
  console.log("Almacén actualizado");
} 