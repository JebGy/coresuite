import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { notificarAprobacionSolicitud } from '../../../../lib/emailService';
import { registrarLog } from '../../../../lib/logger';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: 'ID de solicitud inválido' });
  }

  const solicitudId = parseInt(id);

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Verificar que la solicitud existe
    const solicitudExistente = await prisma.solicitud.findUnique({
      where: { id: solicitudId },
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

    if (!solicitudExistente) {
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }

    if (solicitudExistente.estado === 'APROBADO') {
      return res.status(400).json({ error: 'La solicitud ya está aprobada' });
    }

    // Actualizar el estado de la solicitud a APROBADO
    const solicitudActualizada = await prisma.solicitud.update({
      where: { id: solicitudId },
      data: {
        estado: 'APROBADO',
        createdAt: new Date(),
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


    try {
      await notificarAprobacionSolicitud(
        {
          asunto: 'Solicitud Aprobada',
          estado: "APROBADO",
          solicitante:solicitudExistente.usuario,
          solicitudId: solicitudExistente.id,
          motivo:solicitudActualizada.motivo || undefined
        }
      );
    } catch (emailError) {
      console.error('Error al enviar notificación por email:', emailError);
    }

    return res.status(200).json({
      message: 'Solicitud aprobada exitosamente',
      solicitud: solicitudActualizada,
    });
  } catch (error) {
    console.error('Error al aprobar solicitud:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}