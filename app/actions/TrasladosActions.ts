'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { registrarLog } from '@/lib/logger'

export async function createTraslado(data: {
  cantidad: number
  productoId: number
  almacenOrigenId: number
  almacenDestinoId: number
  trabajadorId: number
  observaciones?: string
}) {
  try {
    // Generate a unique guide number (you might want to implement your own logic)
    const date = new Date()
    const numeroGuia = `TR-${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`

    const traslado = await prisma.traslado.create({
      data: {
        ...data,
        numeroGuia,
        estado: 'PENDIENTE',
      },
      include: {
        producto: true,
        almacenOrigen: true,
        almacenDestino: true
      }
    })

    await registrarLog({
      usuarioId: data.trabajadorId,
      accion: "CREAR",
      entidad: "Traslado",
      entidadId: traslado.id,
      detalles: `Traslado creado: ${traslado.numeroGuia} - Producto: ${traslado.producto.nombre} - Origen: ${traslado.almacenOrigen.nombre} - Destino: ${traslado.almacenDestino.nombre}`,
    });

    revalidatePath('/traslados')
    return { success: true, data: traslado }
  } catch (error) {
    console.error('Error creating traslado:', error)
    return { success: false, error: 'Error al crear el traslado' }
  }
}

import { ApiResponse, Traslado } from '@/types'

export async function getTraslados(): Promise<ApiResponse<Traslado[]>> {
  try {
    const traslados = await prisma.traslado.findMany({
      include: {
        producto: true,
        almacenOrigen: true,
        almacenDestino: true,
        trabajador: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    const formattedTraslados: Traslado[] = traslados.map(t => ({
      id: t.id,
      numeroGuia: t.numeroGuia,
      producto: {
        id: t.producto.id,
        nombre: t.producto.nombre
      },
      almacenOrigen: {
        id: t.almacenOrigen.id,
        nombre: t.almacenOrigen.nombre
      },
      almacenDestino: {
        id: t.almacenDestino.id,
        nombre: t.almacenDestino.nombre
      },
      cantidad: t.cantidad,
      estado: t.estado as 'PENDIENTE' | 'APROBADO' | 'RECHAZADO' | 'COMPLETADO',
      observaciones: t.observaciones || undefined,
      trabajadorId: t.trabajadorId
    }));

    return { success: true, data: formattedTraslados }
  } catch (error) {
    console.error('Error fetching traslados:', error)
    return { success: false, error: 'Error al obtener los traslados' }
  }
}

export async function updateTrasladoStatus(id: number, estado: string) {
  try {
    const traslado = await prisma.traslado.update({
      where: { id },
      data: {
        estado,
        fechaAprobacion: estado === 'APROBADO' ? new Date() : null,
      },
      include: {
        producto: true,
        almacenOrigen: true,
        almacenDestino: true
      }
    })

    await registrarLog({
      usuarioId: traslado.trabajadorId,
      accion: "ACTUALIZAR",
      entidad: "Traslado",
      entidadId: traslado.id,
      detalles: `Traslado ${traslado.numeroGuia} - Estado actualizado a: ${estado} - Producto: ${traslado.producto.nombre} - Origen: ${traslado.almacenOrigen.nombre} - Destino: ${traslado.almacenDestino.nombre}`,
    });

    if (estado === 'COMPLETADO') {
      // Create movement records for both warehouses
      const movimientos = await prisma.movimiento.createMany({
        data: [
          {
            tipo: 'SALIDA',
            fecha: new Date(),
            cantidad: traslado.cantidad,
            motivo: `Traslado #${traslado.numeroGuia}`,
            productoId: traslado.productoId,
            almacenId: traslado.almacenOrigenId,
          },
          {
            tipo: 'ENTRADA',
            fecha: new Date(),
            cantidad: traslado.cantidad,
            motivo: `Traslado #${traslado.numeroGuia}`,
            productoId: traslado.productoId,
            almacenId: traslado.almacenDestinoId,
          },
        ],
      });

      await registrarLog({
        usuarioId: traslado.trabajadorId,
        accion: "MOVIMIENTO",
        entidad: "Traslado",
        entidadId: traslado.id,
        detalles: `Movimientos generados para traslado ${traslado.numeroGuia} - Producto: ${traslado.producto.nombre} - Cantidad: ${traslado.cantidad} - Origen: ${traslado.almacenOrigen.nombre} - Destino: ${traslado.almacenDestino.nombre}`,
      });
    }

    revalidatePath('/traslados')
    return { success: true, data: traslado }
  } catch (error) {
    console.error('Error updating traslado status:', error)
    return { success: false, error: 'Error al actualizar el estado del traslado' }
  }
}
