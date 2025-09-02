import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { notificarNuevaSolicitud } from '../../lib/emailService';
import { registrarLog } from '../../lib/logger';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case 'GET':
        return await getSolicitudes(req, res);
      case 'POST':
        return await createSolicitud(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ message: 'Método no permitido' });
    }
  } catch (error) {
    console.error('Error en API solicitudes:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}

async function getSolicitudes(req: NextApiRequest, res: NextApiResponse) {
  try {
    const solicitudes = await prisma.solicitud.findMany({
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.status(200).json({ solicitudes });
  } catch (error) {
    console.error('Error al obtener solicitudes:', error);
    return res.status(500).json({ message: 'Error al obtener solicitudes' });
  }
}

async function createSolicitud(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { usuarioId, asunto, elementos } = req.body;

    // Validaciones
    if (!usuarioId || !asunto || !elementos || !Array.isArray(elementos)) {
      return res.status(400).json({ 
        message: 'Datos incompletos. Se requiere usuarioId, asunto y elementos.' 
      });
    }

    if (elementos.length === 0) {
      return res.status(400).json({ 
        message: 'Debe incluir al menos un elemento en la solicitud.' 
      });
    }

    // Validar que todos los elementos tengan nombre y cantidad
    for (const elemento of elementos) {
      if (!elemento.nombre || !elemento.cantidad || elemento.cantidad <= 0) {
        return res.status(400).json({ 
          message: 'Todos los elementos deben tener nombre y cantidad válida.' 
        });
      }
    }

    // Verificar que el usuario existe
    const usuario = await prisma.trabajador.findUnique({
      where: { id: usuarioId },
      include: { rol: true },
    });

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Crear la solicitud
    const nuevaSolicitud = await prisma.solicitud.create({
      data: {
        usuarioId,
        asunto,
        elementos: elementos,
        estado: 'PENDIENTE',
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


    // Enviar notificación por correo electrónico
    try {
      await notificarNuevaSolicitud({
        solicitudId: nuevaSolicitud.id,
        asunto: nuevaSolicitud.asunto,
        solicitante: {
          nombres: usuario.nombres,
          apellidos: usuario.apellidos,
          email: usuario.email,
        },
        elementos: nuevaSolicitud.elementos as { nombre: string; cantidad: number }[],
        fechaSolicitud: nuevaSolicitud.createdAt.toLocaleDateString('es-ES'),
      });
    } catch (emailError) {
      console.error('Error al enviar notificación por correo:', emailError);
      // No fallar la creación de la solicitud si el correo falla
    }

    return res.status(201).json({ 
      message: 'Solicitud creada exitosamente',
      solicitud: nuevaSolicitud 
    });
  } catch (error) {
    console.error('Error al crear solicitud:', error);
    return res.status(500).json({ message: 'Error al crear solicitud' });
  }
}