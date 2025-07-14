"use server";

import { prisma } from "@/lib/prisma";
import { Producto } from "@/types";

export async function addProudcto(producto: Producto) {
  await prisma.producto.create({
    data: {
      codigo: producto.codigo,
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      almacenId: producto.almacenId || null,
    },
  });
  console.log("Agregado");
}

export async function getProductos(): Promise<Producto[]> {
  const productos = await prisma.producto.findMany({
    include: {
      almacen: true,
    },
  });
  // Convertir null a undefined en descripcion y almacenId para cumplir con el tipo Producto
  return productos.map((p) => ({
    id: p.id,
    codigo: p.codigo,
    nombre: p.nombre,
    descripcion: p.descripcion === null ? undefined : p.descripcion,
    almacenId: p.almacenId === null ? undefined : p.almacenId,
  }));
}
