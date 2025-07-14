import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const logs = await prisma.log.findMany({
      orderBy: { fecha: 'desc' },
      include: {
        usuario: {
          select: { id: true, nombres: true, apellidos: true, email: true }
        }
      }
    });
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los logs' });
  }
} 