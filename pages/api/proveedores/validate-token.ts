import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({ 
        success: false, 
        message: 'Token requerido' 
      });
    }

    // Buscar el token en la base de datos
    const registrationToken = await prisma.proveedorRegistrationToken.findUnique({
      where: { token },
      include: {
        segmento: true
      }
    });

    if (!registrationToken) {
      return res.status(404).json({ 
        success: false, 
        message: 'Token no encontrado' 
      });
    }

    // Verificar si el token ha expirado
    if (new Date() > registrationToken.expiresAt) {
      return res.status(410).json({ 
        success: false, 
        message: 'Token expirado' 
      });
    }

    // Verificar si el token ya fue usado
    if (registrationToken.used) {
      return res.status(410).json({ 
        success: false, 
        message: 'Token ya utilizado' 
      });
    }

    res.status(200).json({
      success: true,
      segmentoId: registrationToken.segmentoId,
      segmento: registrationToken.segmento,
      expiresAt: registrationToken.expiresAt.toISOString()
    });

  } catch (error) {
    console.error('Error validating token:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
}