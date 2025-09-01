"use server";

import { prisma } from "@/lib/prisma";
import { Movimiento } from "@/types";
import { registrarLog } from "@/lib/logger";


export async function addMovimiento(
  movimiento: Omit<Movimiento, "id">,
  usuarioId: number
) {
  // Si es un movimiento de salida, buscar el último precio de entrada
  let precioUnitarioFinal = movimiento.precioUnitario;

  if (movimiento.tipo === "salida") {
    const ultimaEntrada = await prisma.movimiento.findFirst({
      where: {
        productoId: movimiento.productoId,
        tipo: "entrada",
        precioUnitario: { not: null },
      },
      orderBy: {
        fecha: "desc",
      },
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

  // Si es un movimiento de entrada, generar constancia de recepción automáticamente
  if (movimiento.tipo === "entrada") {
    try {
      // Obtener el movimiento con sus relaciones para la constancia
      const movimientoCompleto = await prisma.movimiento.findUnique({
        where: { id: nuevoMovimiento.id },
        include: {
          producto: true,
          almacen: true,
        },
      });

      if (movimientoCompleto) {
        // Crear registro de constancia en la base de datos
        const constancia = await prisma.constanciaRecepcion.create({
          data: {
            fecha: new Date(),
            horaEntrada: new Date().toLocaleTimeString('es-PE', {
              hour: '2-digit',
              minute: '2-digit'
            }),
            descripcionProducto: `${movimientoCompleto.producto.nombre} - ${movimientoCompleto.producto.descripcion || ''}`,
            proveedorId: 1, // Default proveedor - se puede modificar después
            numeroGuia: movimiento.factura || undefined,
            observaciones: movimiento.motivo,
            movimientoId: nuevoMovimiento.id,
          },
        });

        await registrarLog({
          usuarioId: usuarioId,
          accion: "CREAR",
          entidad: "ConstanciaRecepcion",
          entidadId: constancia.id,
          detalles: `Constancia de recepción generada automáticamente para movimiento ${nuevoMovimiento.id}`,
        });

        console.log(`Constancia de recepción ${constancia.numero} generada automáticamente`);
        return constancia;
      }
    } catch (error) {
      console.error("Error generando constancia automática:", error);
      // No fallar el proceso principal si hay error en la constancia
    }
  }

  console.log("Movimiento agregado");
  return nuevoMovimiento;
}

export async function getMovimientos(): Promise<Movimiento[]> {
  const movimientos = await prisma.movimiento.findMany({
    include: {
      producto: true,
      almacen: true,
    },
    orderBy: {
      fecha: "desc",
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
    factura: m.factura || undefined,

    almacenId: m.almacenId,
  }));
}

export async function getMovimientosByProducto(
  productoId: number
): Promise<Movimiento[]> {
  const movimientos = await prisma.movimiento.findMany({
    where: { productoId },
    include: {
      producto: true,
      almacen: true,
    },
    orderBy: {
      fecha: "asc",
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
    factura: m.factura || undefined,

    almacenId: m.almacenId,
  }));
}

export async function deleteMovimiento(id: number, usuarioId: number) {
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

export async function updateMovimiento(
  id: number,
  movimiento: Partial<Movimiento>,
  usuarioId: number
) {
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
