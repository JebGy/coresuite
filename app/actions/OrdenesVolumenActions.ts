"use server";

import { prisma } from "@/lib/prisma";
import { OrdenVolumen } from "@/types";
import { registrarLog } from "@/lib/logger";

// ─── Serialización base ──────────────────────────────────────────────────────
function serializarOrden(orden: any): OrdenVolumen {
  return {
    ...orden,
    estado: orden.estado as "pendiente" | "aprobada" | "rechazada",
    fechaSolicitud: orden.fechaSolicitud.toISOString(),
    fechaAprobacion: orden.fechaAprobacion
      ? orden.fechaAprobacion.toISOString()
      : undefined,
    createdAt: orden.createdAt.toISOString(),
    updatedAt: orden.updatedAt.toISOString(),
    trabajador: orden.trabajador
      ? {
          ...orden.trabajador,
          createdAt: orden.trabajador.createdAt.toISOString(),
          updatedAt: orden.trabajador.updatedAt.toISOString(),
          unidad: orden.trabajador.unidad
            ? {
                ...orden.trabajador.unidad,
                descripcion: orden.trabajador.unidad.descripcion ?? undefined,
              }
            : undefined,
        }
      : undefined,
    items: (orden.items ?? []).map((item: any) => ({
      ...item,
      producto: item.producto
        ? { ...item.producto, descripcion: item.producto.descripcion ?? undefined }
        : undefined,
      almacen: item.almacen
        ? {
            ...item.almacen,
            descripcion: item.almacen.descripcion ?? undefined,
            ubicacion: item.almacen.ubicacion ?? undefined,
          }
        : undefined,
    })),
  } as OrdenVolumen;
}

const includeCompleto = {
  trabajador: { include: { unidad: true } },
  items: {
    include: {
      producto: true,
      almacen: true,
    },
  },
};

// ─── GET paginado ────────────────────────────────────────────────────────────
export async function getOrdenesVolumen(
  page = 1,
  pageSize = 20
): Promise<{ ordenes: OrdenVolumen[]; total: number; totalPages: number }> {
  const skip = (page - 1) * pageSize;
  const [ordenes, total] = await Promise.all([
    prisma.ordenVolumen.findMany({
      skip,
      take: pageSize,
      include: includeCompleto,
      orderBy: { fechaSolicitud: "desc" },
    }),
    prisma.ordenVolumen.count(),
  ]);
  return {
    ordenes: ordenes.map(serializarOrden),
    total,
    totalPages: Math.ceil(total / pageSize),
  };
}

// ─── CREATE ──────────────────────────────────────────────────────────────────
export async function createOrdenVolumen(
  data: {
    trabajadorId: number;
    motivo: string;
    observaciones?: string;
    items: { productoId: number; almacenId: number; cantidad: number }[];
  },
  usuarioId: number
): Promise<OrdenVolumen> {
  if (!data.items || data.items.length === 0) {
    throw new Error("La orden debe tener al menos un ítem");
  }

  const numeroTicket = `VOL-${Date.now()}-${Math.random()
    .toString(36)
    .substr(2, 9)}`;

  const orden = await prisma.ordenVolumen.create({
    data: {
      numeroTicket,
      trabajadorId: data.trabajadorId,
      motivo: data.motivo,
      observaciones: data.observaciones,
      estado: "pendiente",
      items: {
        create: data.items.map((item) => ({
          productoId: item.productoId,
          almacenId: item.almacenId,
          cantidad: item.cantidad,
        })),
      },
    },
    include: includeCompleto,
  });

  if (usuarioId > 0) {
    await registrarLog({
      usuarioId,
      accion: "CREAR",
      entidad: "OrdenVolumen",
      entidadId: orden.id,
      detalles: `Orden de volumen creada: Ticket ${orden.numeroTicket} con ${data.items.length} ítem(s)`,
    });
  }

  return serializarOrden(orden);
}

// ─── APROBAR ─────────────────────────────────────────────────────────────────
export async function aprobarOrdenVolumen(
  id: number,
  usuarioId: number
): Promise<{ success: true; orden: OrdenVolumen } | { success: false; error: string }> {
  try {
    const orden = await prisma.ordenVolumen.findUnique({
      where: { id },
      include: includeCompleto,
    });

    if (!orden) return { success: false, error: "Orden no encontrada" };
    if (orden.estado !== "pendiente")
      return { success: false, error: "La orden no está en estado pendiente" };

    // Verificar stock por cada ítem
    for (const item of orden.items) {
      const movimientos = await prisma.movimiento.findMany({
        where: { productoId: item.productoId, almacenId: item.almacenId },
      });
      let stock = 0;
      for (const m of movimientos) {
        stock += m.tipo === "entrada" ? m.cantidad : -m.cantidad;
      }
      if (stock < item.cantidad) {
        return {
          success: false,
          error: `Stock insuficiente para el producto ${item.producto?.nombre ?? item.productoId}. Disponible: ${stock}, Solicitado: ${item.cantidad}`,
        };
      }
    }

    // Actualizar estado y crear movimientos por ítem en una transacción
    const [ordenActualizada] = await prisma.$transaction([
      prisma.ordenVolumen.update({
        where: { id },
        data: { estado: "aprobada", fechaAprobacion: new Date() },
        include: includeCompleto,
      }),
      ...orden.items.map((item) =>
        prisma.movimiento.create({
          data: {
            tipo: "salida",
            fecha: new Date(),
            cantidad: item.cantidad,
            motivo: `Entrega volumen aprobada - Ticket: ${orden.numeroTicket}`,
            productoId: item.productoId,
            almacenId: item.almacenId,
          },
        })
      ),
    ]);

    if (usuarioId > 0) {
      await registrarLog({
        usuarioId,
        accion: "ACTUALIZAR",
        entidad: "OrdenVolumen",
        entidadId: id,
        detalles: `Orden de volumen aprobada: ${orden.numeroTicket}`,
      });
    }

    return { success: true, orden: serializarOrden(ordenActualizada) };
  } catch (err) {
    const mensaje = err instanceof Error ? err.message : "Error desconocido al aprobar";
    console.error("[aprobarOrdenVolumen]", err);
    return { success: false, error: mensaje };
  }
}

// ─── RECHAZAR ────────────────────────────────────────────────────────────────
export async function rechazarOrdenVolumen(
  id: number,
  motivo: string,
  usuarioId: number
): Promise<{ success: true; orden: OrdenVolumen } | { success: false; error: string }> {
  try {
    const orden = await prisma.ordenVolumen.update({
      where: { id },
      data: { estado: "rechazada", observaciones: motivo },
      include: includeCompleto,
    });

    if (usuarioId > 0) {
      await registrarLog({
        usuarioId,
        accion: "ACTUALIZAR",
        entidad: "OrdenVolumen",
        entidadId: id,
        detalles: `Orden de volumen rechazada: ${orden.numeroTicket}`,
      });
    }

    return { success: true, orden: serializarOrden(orden) };
  } catch (err) {
    const mensaje = err instanceof Error ? err.message : "Error desconocido al rechazar";
    console.error("[rechazarOrdenVolumen]", err);
    return { success: false, error: mensaje };
  }
}
