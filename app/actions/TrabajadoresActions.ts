'use server'

import { prisma } from '@/lib/prisma'
import { Trabajador } from '@/types'

export async function getTrabajadores(): Promise<Trabajador[]> {
  try {
    const trabajadores = await prisma.trabajador.findMany({
      include: {
        unidad: true
      },
      orderBy: {
        apellidos: 'asc'
      }
    })
    
    return trabajadores.map((t: any) => ({
      ...t,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString()
    }))
  } catch (error) {
    console.error('Error al obtener trabajadores:', error)
    throw new Error('Error al obtener trabajadores')
  }
}

export async function createTrabajador(data: {
  dni: string
  nombres: string
  apellidos: string
  email: string
  telefono: string
  unidadId: number
}): Promise<Trabajador> {
  try {
    const trabajador = await prisma.trabajador.create({
      data,
      include: {
        unidad: true
      }
    })
    
    return {
      ...trabajador,
      unidad: {
        ...trabajador.unidad,
        descripcion: trabajador.unidad.descripcion ?? undefined,
      },
      createdAt: trabajador.createdAt.toISOString(),
      updatedAt: trabajador.updatedAt.toISOString(),
    }
  } catch (error) {
    console.error('Error al crear trabajador:', error)
    throw new Error('Error al crear trabajador')
  }
}

export async function updateTrabajador(id: number, data: {
  dni?: string
  nombres?: string
  apellidos?: string
  email?: string
  telefono?: string
  unidadId?: number
}): Promise<Trabajador> {
  try {
    const trabajador = await prisma.trabajador.update({
      where: { id },
      data,
      include: {
        unidad: true
      }
    })
    
    return {
      ...trabajador,
      unidad: {
        ...trabajador.unidad,
        descripcion: trabajador.unidad.descripcion ?? undefined,
      },
      createdAt: trabajador.createdAt.toISOString(),
      updatedAt: trabajador.updatedAt.toISOString(),
    }
  } catch (error) {
    console.error('Error al actualizar trabajador:', error)
    throw new Error('Error al actualizar trabajador')
  }
}

export async function deleteTrabajador(id: number): Promise<void> {
  try {
    await prisma.trabajador.delete({
      where: { id }
    })
  } catch (error) {
    console.error('Error al eliminar trabajador:', error)
    throw new Error('Error al eliminar trabajador')
  }
}

export async function getTrabajadorById(id: number): Promise<Trabajador | null> {
  try {
    const trabajador = await prisma.trabajador.findUnique({
      where: { id },
      include: {
        unidad: true
      }
    })
    
    if (!trabajador) return null
    
    return {
      ...trabajador,
      unidad: {
        ...trabajador.unidad,
        descripcion: trabajador.unidad.descripcion ?? undefined,
      },
      createdAt: trabajador.createdAt.toISOString(),
      updatedAt: trabajador.updatedAt.toISOString(),
    }
  } catch (error) {
    console.error('Error al obtener trabajador:', error)
    throw new Error('Error al obtener trabajador')
  }
} 