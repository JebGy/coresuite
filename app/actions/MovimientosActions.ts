"use server";

import { prisma } from "@/lib/prisma";
import { Movimiento } from "@/types";
import { registrarLog } from "@/lib/logger";

export async function addMovimiento(movimiento: Omit<Movimiento, 'id'>, usuarioId?: number) {
  // Si es un movimiento de salida, buscar el último precio de entrada
  let precioUnitarioFinal = movimiento.precioUnitario;
  
  if (movimiento.tipo === "salida") {
    const ultimaEntrada = await prisma.movimiento.findFirst({
      where: {
        productoId: movimiento.productoId,
        tipo: "entrada",
        precioUnitario: { not: null }
      },
      orderBy: {
        fecha: 'desc'
      }
    });

    if (ultimaEntrada?.precioUnitario) {
      precioUnitarioFinal = ultimaEntrada.precioUnitario;
    }
  }

  const nuevoMovimiento = await prisma.movimiento.create({
    data: {
      tipo: movimiento.tipo,
      fecha: new Date(movimiento.fecha),
      cantidad: movimiento.cantidad,
      precioUnitario: precioUnitarioFinal,
      motivo: movimiento.motivo,
      factura: movimiento.factura,
      productoId: movimiento.productoId,
      almacenId: movimiento.almacenId,
    },
  });

  await registrarLog({
    usuarioId: usuarioId,
    accion: "CREAR",
    entidad: "Movimiento",
    entidadId: nuevoMovimiento.id,
    detalles: `Movimiento creado: ${nuevoMovimiento.tipo}`,
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

export async function deleteMovimiento(id: number, usuarioId?: number) {
  await prisma.movimiento.delete({
    where: { id },
  });
  await registrarLog({
    usuarioId: usuarioId,
    accion: "ELIMINAR",
    entidad: "Movimiento",
    entidadId: id,
    detalles: `Movimiento eliminado`,
  });
  console.log("Movimiento eliminado");
}

export async function updateMovimiento(id: number, movimiento: Partial<Movimiento>, usuarioId?: number) {
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
  await registrarLog({
    usuarioId: usuarioId,
    accion: "ACTUALIZAR",
    entidad: "Movimiento",
    entidadId: id,
    detalles: `Movimiento actualizado`,
  });
  console.log("Movimiento actualizado");
}
