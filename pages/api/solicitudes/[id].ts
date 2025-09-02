import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { notificarAprobacionSolicitud } from '../../../lib/emailService';
import { registrarLog } from '@/lib/logger';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ message: 'ID de solicitud inválido' });
  }

  const solicitudId = parseInt(id);

  try {
    switch (req.method) {
      case 'GET':
        return await getSolicitud(solicitudId, res);
      case 'PUT':
        return await updateSolicitud(solicitudId, req, res);
      case 'DELETE':
        return await deleteSolicitud(solicitudId, req, res);
      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).json({ message: 'Método no permitido' });
    }
  } catch (error) {
    console.error('Error en API solicitud:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}

async function getSolicitud(id: number, res: NextApiResponse) {
  try {
    const solicitud = await prisma.solicitud.findUnique({
      where: { id },
      include: {
        usuario: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            email: true,
          },
        },
      },
    });

    if (!solicitud) {
      return res.status(404).json({ message: 'Solicitud no encontrada' });
    }

    return res.status(200).json({ solicitud });
  } catch (error) {
    console.error('Error al obtener solicitud:', error);
    return res.status(500).json({ message: 'Error al obtener solicitud' });
  }
}

async function updateSolicitud(id: number, req: NextApiRequest, res: NextApiResponse) {
  try {
    const { estado, motivo, usuarioAprobadorId } = req.body;

    // Validaciones
    if (!estado || !['PENDIENTE', 'APROBADO', 'RECHAZADO'].includes(estado)) {
      return res.status(400).json({ 
        message: 'Estado inválido. Debe ser PENDIENTE, APROBADO o RECHAZADO.' 
      });
    }

    if (estado === 'RECHAZADO' && !motivo) {
      return res.status(400).json({ 
        message: 'El motivo es requerido para rechazar una solicitud.' 
      });
    }

    // Verificar que la solicitud existe
    const solicitudExistente = await prisma.solicitud.findUnique({
      where: { id },
      include: {
        usuario: {
          select: {
            nombres: true,
            apellidos: true,
            email: true,
          },
        },
      },
    });

    if (!solicitudExistente) {
      return res.status(404).json({ message: 'Solicitud no encontrada' });
    }

    // Actualizar la solicitud
    const solicitudActualizada = await prisma.solicitud.update({
      where: { id },
      data: {
        estado,
        motivo: estado === 'RECHAZADO' ? motivo : null,
        updatedAt: new Date(),
      },
      include: {
        usuario: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            email: true,
          },
        },
      },
    });

 

    // Enviar notificación por correo electrónico al solicitante
    try {
      await notificarAprobacionSolicitud({
        solicitudId: id,
        asunto: solicitudExistente.asunto,
        estado: estado as 'APROBADO' | 'RECHAZADO',
        motivo: estado === 'RECHAZADO' ? motivo : undefined,
        solicitante: {
          nombres: solicitudExistente.usuario.nombres,
          apellidos: solicitudExistente.usuario.apellidos,
          email: solicitudExistente.usuario.email,
        },
      });
    } catch (emailError) {
      console.error('Error al enviar notificación por correo:', emailError);
      // No fallar la actualización si el correo falla
    }

    return res.status(200).json({ 
      message: `Solicitud ${estado.toLowerCase()} exitosamente`,
      solicitud: solicitudActualizada 
    });
  } catch (error) {
    console.error('Error al actualizar solicitud:', error);
    return res.status(500).json({ message: 'Error al actualizar solicitud' });
  }
}

async function deleteSolicitud(id: number, req: NextApiRequest, res: NextApiResponse) {
  try {
    const { usuarioId } = req.body;

    // Verificar que la solicitud existe
    const solicitud = await prisma.solicitud.findUnique({
      where: { id },
    });

    if (!solicitud) {
      return res.status(404).json({ message: 'Solicitud no encontrada' });
    }

    // Solo permitir eliminar solicitudes pendientes
    if (solicitud.estado !== 'PENDIENTE') {
      return res.status(400).json({ 
        message: 'Solo se pueden eliminar solicitudes pendientes' 
      });
    }

    // Eliminar la solicitud
    await prisma.solicitud.delete({
      where: { id },
    });


    return res.status(200).json({ message: 'Solicitud eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar solicitud:', error);
    return res.status(500).json({ message: 'Error al eliminar solicitud' });
  }
}