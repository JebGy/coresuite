"use server";

import { prisma } from "@/lib/prisma";
import { OrdenEntrega } from "@/types";
import { registrarLog } from "@/lib/logger";

export async function getOrdenesEntrega(): Promise<OrdenEntrega[]> {
  try {
    const ordenes = await prisma.ordenEntrega.findMany({
      include: {
        trabajador: {
          include: {
            unidad: true,
          },
        },
        producto: true,
        almacen: true,
      },
      orderBy: {
        fechaSolicitud: "desc",
      },
    });

    return ordenes.map((o) => ({
      ...o,
      estado: o.estado,
      fechaSolicitud: o.fechaSolicitud.toISOString(),
      fechaAprobacion: o.fechaAprobacion
        ? o.fechaAprobacion.toISOString()
        : undefined,
      createdAt: o.createdAt.toISOString(),
      updatedAt: o.updatedAt.toISOString(),
      trabajador: o.trabajador
        ? {
            ...o.trabajador,
            createdAt: o.trabajador.createdAt.toISOString(),
            updatedAt: o.trabajador.updatedAt.toISOString(),
            unidad: o.trabajador.unidad
              ? {
                  ...o.trabajador.unidad,
                  descripcion: o.trabajador.unidad.descripcion ?? undefined,
                }
              : undefined,
          }
        : undefined,
      producto: o.producto
        ? {
            ...o.producto,
            descripcion: o.producto.descripcion ?? undefined,
          }
        : undefined,
      almacen: o.almacen
        ? {
            ...o.almacen,
            descripcion: o.almacen.descripcion ?? undefined,
            ubicacion: o.almacen.ubicacion ?? undefined,
          }
        : undefined,
    })) as OrdenEntrega[];
  } catch (error) {
    console.error("Error al obtener órdenes de entrega:", error);
    throw new Error("Error al obtener órdenes de entrega");
  }
}

export async function createOrdenEntrega(
  data: {
    cantidad: number;
    motivo: string;
    observaciones?: string;
    trabajadorId: number;
    productoId: number;
    almacenId: number;
    trabajadorNombre: string;
    productoNombre: string;
  },
  usuarioId?: number
): Promise<OrdenEntrega> {
  try {
    // Generar número de ticket único
    const numeroTicket = `TKT-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;

      //remove trabajador nombre y producto nombre de data
      const { trabajadorNombre, productoNombre, ...restoData } = data;

    const orden = await prisma.ordenEntrega.create({
      data: {
        ...restoData,
        numeroTicket,
        estado: "pendiente",
      },
      include: {
        trabajador: {
          include: {
            unidad: true,
          },
        },
        producto: true,
        almacen: true,
      },
    });
    await registrarLog({
      usuarioId: usuarioId,
      accion: "CREAR",
      entidad: "OrdenEntrega",
      entidadId: orden.id,
      detalles: `Orden de entrega creada: Ticket ${orden.numeroTicket}`,
    });

    // Adaptación para evitar el error de tipos y asegurar compatibilidad con OrdenEntrega
    return {
      ...orden,
      estado: orden.estado as "pendiente" | "aprobada" | "rechazada" | "entregada",
      fechaSolicitud: orden.fechaSolicitud.toISOString(),
      fechaAprobacion: orden.fechaAprobacion ? orden.fechaAprobacion.toISOString() : undefined,
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
      producto: orden.producto
        ? {
            ...orden.producto,
            descripcion: orden.producto.descripcion ?? undefined,
          }
        : undefined,
      almacen: orden.almacen
        ? {
            ...orden.almacen,
            descripcion: orden.almacen.descripcion ?? undefined,
            ubicacion: orden.almacen.ubicacion ?? undefined,
          }
        : undefined,
    } as OrdenEntrega;
  } catch (error) {
    console.error("Error al crear orden de entrega:", error);
    throw new Error("Error al crear orden de entrega");
  }
}

export async function aprobarOrdenEntrega(
  id: number,
  usuarioId?: number
): Promise<OrdenEntrega> {
  try {
    // Obtener la orden
    const orden = await prisma.ordenEntrega.findUnique({
      where: { id },
      include: {
        producto: true,
        almacen: true,
      },
    });

    if (!orden) {
      throw new Error("Orden de entrega no encontrada");
    }

    if (orden.estado !== "pendiente") {
      throw new Error("La orden no está en estado pendiente");
    }

    // Verificar stock disponible
    const stockDisponible = await getStockDisponible(
      orden.productoId,
      orden.almacenId
    );
    if (stockDisponible < orden.cantidad) {
      throw new Error(
        `Stock insuficiente. Disponible: ${stockDisponible}, Solicitado: ${orden.cantidad}`
      );
    }

    // Actualizar orden y crear movimiento
    const [ordenActualizada] = await prisma.$transaction([
      prisma.ordenEntrega.update({
        where: { id },
        data: {
          estado: "aprobada",
          fechaAprobacion: new Date(),
        },
        include: {
          trabajador: {
            include: {
              unidad: true,
            },
          },
          producto: true,
          almacen: true,
        },
      }),
      prisma.movimiento.create({
        data: {
          tipo: "salida",
          fecha: new Date(),
          cantidad: orden.cantidad,
          motivo: `Entrega aprobada - Ticket: ${orden.numeroTicket}`,
          productoId: orden.productoId,
          almacenId: orden.almacenId,
          ordenEntregaId: id,
        },
      }),
    ]);
    await registrarLog({
      usuarioId: usuarioId,
      accion: "ACTUALIZAR",
      entidad: "OrdenEntrega",
      entidadId: id,
      detalles: `Orden de entrega aprobada`,
    });

    return {
      ...ordenActualizada,
      estado: ordenActualizada.estado as
        | "pendiente"
        | "aprobada"
        | "rechazada"
        | "entregada",
      fechaSolicitud: ordenActualizada.fechaSolicitud
        ? ordenActualizada.fechaSolicitud.toISOString()
        : undefined,
      fechaAprobacion: ordenActualizada.fechaAprobacion
        ? ordenActualizada.fechaAprobacion.toISOString()
        : undefined,
      createdAt: ordenActualizada.createdAt
        ? ordenActualizada.createdAt.toISOString()
        : undefined,
      updatedAt: ordenActualizada.updatedAt
        ? ordenActualizada.updatedAt.toISOString()
        : undefined,
      trabajador: ordenActualizada.trabajador
        ? {
            ...ordenActualizada.trabajador,
            createdAt: ordenActualizada.trabajador.createdAt
              ? ordenActualizada.trabajador.createdAt.toISOString()
              : undefined,
            updatedAt: ordenActualizada.trabajador.updatedAt
              ? ordenActualizada.trabajador.updatedAt.toISOString()
              : undefined,
          }
        : undefined,
    } as unknown as OrdenEntrega;
  } catch (error) {
    console.error("Error al aprobar orden de entrega:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Error al aprobar orden de entrega"
    );
  }
}

export async function rechazarOrdenEntrega(
  id: number,
  motivo: string,
  usuarioId?: number
): Promise<OrdenEntrega> {
  try {
    const orden = await prisma.ordenEntrega.update({
      where: { id },
      data: {
        estado: "rechazada",
        observaciones: motivo,
      },
      include: {
        trabajador: {
          include: {
            unidad: true,
          },
        },
        producto: true,
        almacen: true,
      },
    });
    await registrarLog({
      usuarioId: usuarioId,
      accion: "ACTUALIZAR",
      entidad: "OrdenEntrega",
      entidadId: id,
      detalles: `Orden de entrega rechazada`,
    });

    // Corregido para asegurar compatibilidad de tipos y serialización de fechas/unidad
    return {
      ...orden,
      estado: orden.estado as
        | "pendiente"
        | "aprobada"
        | "rechazada"
        | "entregada",
      fechaSolicitud: orden.fechaSolicitud.toISOString(),
      fechaAprobacion: orden.fechaAprobacion ? orden.fechaAprobacion.toISOString() : undefined,
      createdAt: orden.createdAt.toISOString(),
      updatedAt: orden.updatedAt.toISOString(),
      trabajador: orden.trabajador
        ? {
            ...orden.trabajador,
            unidad: orden.trabajador.unidad
              ? {
                  ...orden.trabajador.unidad,
                  descripcion: orden.trabajador.unidad.descripcion ?? undefined,
                }
              : undefined,
            createdAt: orden.trabajador.createdAt
              ? orden.trabajador.createdAt.toISOString()
              : undefined,
            updatedAt: orden.trabajador.updatedAt
              ? orden.trabajador.updatedAt.toISOString()
              : undefined,
          }
        : undefined,
    } as OrdenEntrega;
  } catch (error) {
    console.error("Error al rechazar orden de entrega:", error);
    throw new Error("Error al rechazar orden de entrega");
  }
}

export async function getOrdenEntregaById(
  id: number
): Promise<OrdenEntrega | null> {
  try {
    const orden = await prisma.ordenEntrega.findUnique({
      where: { id },
      include: {
        trabajador: {
          include: {
            unidad: true,
          },
        },
        producto: true,
        almacen: true,
      },
    });

    if (!orden) return null;

    return {
      ...orden,
      estado: orden.estado as
        | "pendiente"
        | "aprobada"
        | "rechazada"
        | "entregada",
      fechaSolicitud: orden.fechaSolicitud.toISOString(),
      fechaAprobacion: orden.fechaAprobacion
        ? orden.fechaAprobacion.toISOString()
        : undefined,
      createdAt: orden.createdAt.toISOString(),
      updatedAt: orden.updatedAt.toISOString(),
      trabajador: orden.trabajador
        ? {
            ...orden.trabajador,
            unidad: orden.trabajador.unidad
              ? {
                  ...orden.trabajador.unidad,
                  descripcion: orden.trabajador.unidad.descripcion ?? undefined,
                }
              : undefined,
            createdAt: orden.trabajador.createdAt
              ? orden.trabajador.createdAt.toISOString()
              : undefined,
            updatedAt: orden.trabajador.updatedAt
              ? orden.trabajador.updatedAt.toISOString()
              : undefined,
          }
        : undefined,
    } as OrdenEntrega;
  } catch (error) {
    console.error("Error al obtener orden de entrega:", error);
    throw new Error("Error al obtener orden de entrega");
  }
}

// Función auxiliar para obtener stock disponible
async function getStockDisponible(
  productoId: number,
  almacenId: number
): Promise<number> {
  const movimientos = await prisma.movimiento.findMany({
    where: {
      productoId,
      almacenId,
    },
    orderBy: {
      fecha: "asc",
    },
  });

  let stock = 0;
  for (const movimiento of movimientos) {
    if (movimiento.tipo === "entrada") {
      stock += movimiento.cantidad;
    } else {
      stock -= movimiento.cantidad;
    }
  }

  return Math.max(0, stock);
}
