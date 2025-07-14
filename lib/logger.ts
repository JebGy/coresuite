import { prisma } from './prisma';

export interface LogData {
  usuarioId?: number;
  accion: string;
  entidad: string;
  entidadId?: number;
  detalles?: string;
}

export async function registrarLog({ usuarioId, accion, entidad, entidadId, detalles }: LogData) {
  return prisma.log.create({
    data: {
      usuarioId,
      accion,
      entidad,
      entidadId,
      detalles,
    },
  });
} 