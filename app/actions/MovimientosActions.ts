"use server";

import { prisma } from "@/lib/prisma";
import { Movimiento } from "@/types";

export async function addMovimiento(movimiento: Omit<Movimiento, 'id'>) {
  await prisma.movimiento.create({
    data: {
      tipo: movimiento.tipo,
      fecha: new Date(movimiento.fecha),
      cantidad: movimiento.cantidad,
      precioUnitario: movimiento.precioUnitario,
      motivo: movimiento.motivo,
      productoId: movimiento.productoId,
      almacenId: movimiento.almacenId,
    },
  });
  console.log("Movimiento agregado");
}

export async function getMovimientos(): Promise<Movimiento[]> {
  const movimientos = await prisma.movimiento.findMany({
    include: {
      producto: true,
      almacen: true,
    },
    orderBy: {
      fecha: 'desc',
    },
  });

  return movimientos.map((m) => ({
    id: m.id,
    tipo: m.tipo as "entrada" | "salida",
    fecha: m.fecha.toISOString().slice(0, 10),
    cantidad: m.cantidad,
    precioUnitario: m.precioUnitario || undefined,
    motivo: m.motivo,
    productoId: m.productoId,
    almacenId: m.almacenId,
  }));
}

export async function getMovimientosByProducto(productoId: number): Promise<Movimiento[]> {
  const movimientos = await prisma.movimiento.findMany({
    where: { productoId },
    include: {
      producto: true,
      almacen: true,
    },
    orderBy: {
      fecha: 'asc',
    },
  });

  return movimientos.map((m) => ({
    id: m.id,
    tipo: m.tipo as "entrada" | "salida",
    fecha: m.fecha.toISOString().slice(0, 10),
    cantidad: m.cantidad,
    precioUnitario: m.precioUnitario || undefined,
    motivo: m.motivo,
    productoId: m.productoId,
    almacenId: m.almacenId,
  }));
}

export async function deleteMovimiento(id: number) {
  await prisma.movimiento.delete({
    where: { id },
  });
  console.log("Movimiento eliminado");
}

export async function updateMovimiento(id: number, movimiento: Partial<Movimiento>) {
  await prisma.movimiento.update({
    where: { id },
    data: {
      tipo: movimiento.tipo,
      fecha: movimiento.fecha ? new Date(movimiento.fecha) : undefined,
      cantidad: movimiento.cantidad,
      precioUnitario: movimiento.precioUnitario,
      motivo: movimiento.motivo,
      productoId: movimiento.productoId,
      almacenId: movimiento.almacenId,
    },
  });
  console.log("Movimiento actualizado");
}
