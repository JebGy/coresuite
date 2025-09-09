import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    const { segmentoId, expiresInHours = 72 } = req.body;

    // Validar que el segmento existe
    if (segmentoId) {
      const segmento = await prisma.segmento.findUnique({
        where: { id: segmentoId }
      });
      
      if (!segmento) {
        return res.status(400).json({ message: 'Segmento no encontrado' });
      }
    }

    // Generar token único
    const token = crypto.randomBytes(32).toString('hex');
    
    // Calcular fecha de expiración
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expiresInHours);

    // Crear registro del token en la base de datos
    const registrationToken = await prisma.proveedorRegistrationToken.create({
      data: {
        token,
        segmentoId: segmentoId || null,
        expiresAt,
        used: false
      },
      include: {
        segmento: true
      }
    });

    // Generar URL de registro
    const baseUrl = process.env.NEXTAUTH_URL || 'https://coresuite.ramirezgroup.com.pe';
    const registrationUrl = `${baseUrl}/registro-proveedor?token=${token}`;

    res.status(200).json({
      success: true,
      token,
      registrationUrl,
      expiresAt: expiresAt.toISOString(),
      message: 'Token de registro generado exitosamente'
    });

  } catch (error) {
    console.error('Error generando token:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
}