'use server'

import { prisma } from '@/lib/prisma'
import { OrdenEntrega } from '@/types'

export async function getOrdenesEntrega(): Promise<OrdenEntrega[]> {
  try {
    const ordenes = await prisma.ordenEntrega.findMany({
      include: {
        trabajador: {
          include: {
            unidad: true
          }
        },
        producto: true,
        almacen: true
      },
      orderBy: {
        fechaSolicitud: 'desc'
      }
    })
    
    return ordenes.map(o => ({
      ...o,
      fechaSolicitud: o.fechaSolicitud.toISOString(),
      fechaAprobacion: o.fechaAprobacion?.toISOString(),
      createdAt: o.createdAt.toISOString(),
      updatedAt: o.updatedAt.toISOString()
    }))
  } catch (error) {
    console.error('Error al obtener órdenes de entrega:', error)
    throw new Error('Error al obtener órdenes de entrega')
  }
}

export async function createOrdenEntrega(data: {
  cantidad: number
  motivo: string
  observaciones?: string
  trabajadorId: number
  productoId: number
  almacenId: number
}): Promise<OrdenEntrega> {
  try {
    // Generar número de ticket único
    const numeroTicket = `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    const orden = await prisma.ordenEntrega.create({
      data: {
        ...data,
        numeroTicket,
        estado: 'pendiente'
      },
      include: {
        trabajador: {
          include: {
            unidad: true
          }
        },
        producto: true,
        almacen: true
      }
    })
    
    return {
      ...orden,
      fechaSolicitud: orden.fechaSolicitud.toISOString(),
      fechaAprobacion: orden.fechaAprobacion?.toISOString(),
      createdAt: orden.createdAt.toISOString(),
      updatedAt: orden.updatedAt.toISOString()
    }
  } catch (error) {
    console.error('Error al crear orden de entrega:', error)
    throw new Error('Error al crear orden de entrega')
  }
}

export async function aprobarOrdenEntrega(id: number): Promise<OrdenEntrega> {
  try {
    // Obtener la orden
    const orden = await prisma.ordenEntrega.findUnique({
      where: { id },
      include: {
        producto: true,
        almacen: true
      }
    })
    
    if (!orden) {
      throw new Error('Orden de entrega no encontrada')
    }
    
    if (orden.estado !== 'pendiente') {
      throw new Error('La orden no está en estado pendiente')
    }
    
    // Verificar stock disponible
    const stockDisponible = await getStockDisponible(orden.productoId, orden.almacenId)
    if (stockDisponible < orden.cantidad) {
      throw new Error(`Stock insuficiente. Disponible: ${stockDisponible}, Solicitado: ${orden.cantidad}`)
    }
    
    // Actualizar orden y crear movimiento
    const [ordenActualizada, movimiento] = await prisma.$transaction([
      prisma.ordenEntrega.update({
        where: { id },
        data: {
          estado: 'aprobada',
          fechaAprobacion: new Date()
        },
        include: {
          trabajador: {
            include: {
              unidad: true
            }
          },
          producto: true,
          almacen: true
        }
      }),
      prisma.movimiento.create({
        data: {
          tipo: 'salida',
          fecha: new Date(),
          cantidad: orden.cantidad,
          motivo: `Entrega aprobada - Ticket: ${orden.numeroTicket}`,
          productoId: orden.productoId,
          almacenId: orden.almacenId,
          ordenEntregaId: id
        }
      })
    ])
    
    return {
      ...ordenActualizada,
      fechaSolicitud: ordenActualizada.fechaSolicitud.toISOString(),
      fechaAprobacion: ordenActualizada.fechaAprobacion?.toISOString(),
      createdAt: ordenActualizada.createdAt.toISOString(),
      updatedAt: ordenActualizada.updatedAt.toISOString()
    }
  } catch (error) {
    console.error('Error al aprobar orden de entrega:', error)
    throw new Error(error instanceof Error ? error.message : 'Error al aprobar orden de entrega')
  }
}

export async function rechazarOrdenEntrega(id: number, motivo: string): Promise<OrdenEntrega> {
  try {
    const orden = await prisma.ordenEntrega.update({
      where: { id },
      data: {
        estado: 'rechazada',
        observaciones: motivo
      },
      include: {
        trabajador: {
          include: {
            unidad: true
          }
        },
        producto: true,
        almacen: true
      }
    })
    
    return {
      ...orden,
      fechaSolicitud: orden.fechaSolicitud.toISOString(),
      fechaAprobacion: orden.fechaAprobacion?.toISOString(),
      createdAt: orden.createdAt.toISOString(),
      updatedAt: orden.updatedAt.toISOString()
    }
  } catch (error) {
    console.error('Error al rechazar orden de entrega:', error)
    throw new Error('Error al rechazar orden de entrega')
  }
}

export async function getOrdenEntregaById(id: number): Promise<OrdenEntrega | null> {
  try {
    const orden = await prisma.ordenEntrega.findUnique({
      where: { id },
      include: {
        trabajador: {
          include: {
            unidad: true
          }
        },
        producto: true,
        almacen: true
      }
    })
    
    if (!orden) return null
    
    return {
      ...orden,
      fechaSolicitud: orden.fechaSolicitud.toISOString(),
      fechaAprobacion: orden.fechaAprobacion?.toISOString(),
      createdAt: orden.createdAt.toISOString(),
      updatedAt: orden.updatedAt.toISOString()
    }
  } catch (error) {
    console.error('Error al obtener orden de entrega:', error)
    throw new Error('Error al obtener orden de entrega')
  }
}

// Función auxiliar para obtener stock disponible
async function getStockDisponible(productoId: number, almacenId: number): Promise<number> {
  const movimientos = await prisma.movimiento.findMany({
    where: {
      productoId,
      almacenId
    },
    orderBy: {
      fecha: 'asc'
    }
  })
  
  let stock = 0
  for (const movimiento of movimientos) {
    if (movimiento.tipo === 'entrada') {
      stock += movimiento.cantidad
    } else {
      stock -= movimiento.cantidad
    }
  }
  
  return Math.max(0, stock)
} 