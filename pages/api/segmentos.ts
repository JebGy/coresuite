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
    const segmentos = await prisma.segmento.findMany({
      select: {
        id: true,
        nombre: true,
        descripcion: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        nombre: 'asc'
      }
    });

    const segmentosFormatted = segmentos.map(segmento => ({
      ...segmento,
      createdAt: segmento.createdAt.toISOString(),
      updatedAt: segmento.updatedAt.toISOString()
    }));

    res.status(200).json(segmentosFormatted);

  } catch (error) {
    console.error('Error fetching segmentos:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
}