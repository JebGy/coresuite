"use server";

import { prisma } from "@/lib/prisma";
import { Producto } from "@/types";

export async function addProudcto(producto: Producto) {
  await prisma.producto.create({
    data: {
      codigo: producto.codigo,
      nombre: producto.nombre,
      descripcion: producto.descripcion,
    },
  });
  console.log("Agregado");
}

export async function getProductos(): Promise<Producto[]> {
  const productos = await prisma.producto.findMany();
  // Convertir null a undefined en descripcion para cumplir con el tipo Producto
  return productos.map((p) => ({
    ...p,
    descripcion: p.descripcion === null ? undefined : p.descripcion,
  }));
}
