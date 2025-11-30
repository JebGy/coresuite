import { prisma } from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  
  // Implementar cache para optimizar rendimiento
  res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
  
  // Solo permitir GET requests para esta API
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const productosConPrecio = await prisma.producto.findMany({
      include: {
        almacen: true,
        movimientos: {
          where: {
            tipo: "entrada",
            precioUnitario: { not: null },
          },
          orderBy: {
            fecha: "desc",
          },
          take: 1,
          select: {
            precioUnitario: true,
          },
        },
      },
    });

    const productosFormateados = productosConPrecio.map((producto) => ({
      ...producto,
      precioUnitario: producto.movimientos[0]?.precioUnitario || 0,
      movimientos: undefined,
    }));

    res.status(200).json(productosFormateados);
  } catch (error) {
    console.error('Error en getproductos:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
