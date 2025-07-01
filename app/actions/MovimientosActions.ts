import { prisma } from "@/lib/prisma";
import { Movimiento } from "@/types";

// Obtener movimientos por producto
export async function getMovimientosPorProducto(productoId: number) {
  return await prisma.movimiento.findMany({
    where: { productoId },
    orderBy: { fecha: "asc" },
  });
}

// Crear un nuevo movimiento
export async function crearMovimiento(data: Omit<Movimiento, "id">) {
  return await prisma.movimiento.create({
    data: {
      ...data,
      fecha: new Date(data.fecha),
    },
  });
}

// Actualizar un movimiento existente
export async function actualizarMovimiento(id: number, data: Partial<Omit<Movimiento, "id">>) {
  return await prisma.movimiento.update({
    where: { id },
    data: {
      ...data,
      fecha: data.fecha ? new Date(data.fecha) : undefined,
    },
  });
}

// Eliminar un movimiento
export async function eliminarMovimiento(id: number) {
  return await prisma.movimiento.delete({
    where: { id },
  });
}
