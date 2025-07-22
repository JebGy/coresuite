'use server'

import { prisma } from '@/lib/prisma'
import { Trabajador } from '@/types'
import { Rol } from '@/types';
import bcrypt from 'bcryptjs';
import { registrarLog } from "@/lib/logger";

export async function getTrabajadores(): Promise<Trabajador[]> {
  try {
    const trabajadores = await prisma.trabajador.findMany({
      include: {
        unidad: true,
        rol: true
      },
      orderBy: {
        apellidos: 'asc'
      }
    })
    return trabajadores.map((t: any) => ({
      ...t,
      unidad: t.unidad
        ? {
            ...t.unidad,
            descripcion: t.unidad.descripcion ?? undefined,
          }
        : undefined,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
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
  rolId: number
}, usuarioId?: number): Promise<Trabajador> {
  try {
    const hashedPassword = await bcrypt.hash(data.dni, 10);
    const trabajador = await prisma.trabajador.create({
      data: {
        ...data,
        password: hashedPassword // Guardar el hash del DNI
      },
      include: {
        unidad: true
      }
    })
    await registrarLog({
      usuarioId: usuarioId,
      accion: "CREAR",
      entidad: "Trabajador",
      entidadId: trabajador.id,
      detalles: `Trabajador creado: ${trabajador.nombres} ${trabajador.apellidos}`,
    });
    return {
      ...trabajador,
      unidad: trabajador.unidad
        ? {
            ...trabajador.unidad,
            descripcion: trabajador.unidad.descripcion ?? undefined,
          }
        : undefined,
      createdAt: trabajador.createdAt.toISOString(),
      updatedAt: trabajador.updatedAt.toISOString(),
    }
  } catch (error) {
    console.error('Error al crear trabajador:', error);
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        throw new Error('Ya existe un trabajador con ese DNI o correo electrónico');
      } else if (error.message.includes('Foreign key constraint')) {
        throw new Error('La unidad o rol especificado no existe');
      }
      throw new Error(`Error al crear trabajador: ${error.message}`);
    }
    throw new Error('Error inesperado al crear trabajador');
  }
}

export async function updateTrabajador(id: number, data: {
  dni?: string
  nombres?: string
  apellidos?: string
  email?: string
  telefono?: string
  unidadId?: number
  rolId?: number
}, usuario: { permisos: { puedeEditarUsuarios: boolean } }, usuarioId?: number): Promise<Trabajador> {
  if (!usuario.permisos.puedeEditarUsuarios) {
    throw new Error('No tienes permiso para editar usuarios');
  }
  try {
    const trabajador = await prisma.trabajador.update({
      where: { id },
      data,
      include: {
        unidad: true
      }
    })
    await registrarLog({
      usuarioId: usuarioId,
      accion: "ACTUALIZAR",
      entidad: "Trabajador",
      entidadId: id,
      detalles: `Trabajador actualizado`,
    });
    
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

export async function deleteTrabajador(id: number, usuarioId?: number): Promise<void> {
  try {
    await prisma.trabajador.delete({
      where: { id }
    })
    await registrarLog({
      usuarioId: usuarioId,
      accion: "ELIMINAR",
      entidad: "Trabajador",
      entidadId: id,
      detalles: `Trabajador eliminado`,
    });
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

export async function getRoles(): Promise<Rol[]> {
  try {
    const roles = await prisma.rol.findMany();
    return roles.map((r: any) => ({
      ...r,
      descripcion: r.descripcion ?? undefined,
    }));
  } catch (error) {
    console.error('Error al obtener roles:', error);
    throw new Error('Error al obtener roles');
  }
}

export async function updateTrabajadorRol(id: number, rolId: number): Promise<Trabajador> {
  try {
    const trabajador = await prisma.trabajador.update({
      where: { id },
      data: { rolId },
      include: { unidad: true }
    });
    return {
      ...trabajador,
      unidad: {
        ...trabajador.unidad,
        descripcion: trabajador.unidad.descripcion ?? undefined,
      },
      createdAt: trabajador.createdAt.toISOString(),
      updatedAt: trabajador.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error('Error al actualizar el rol del trabajador:', error);
    throw new Error('Error al actualizar el rol del trabajador');
  }
} 