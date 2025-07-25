import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Configuración de CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Manejar solicitudes OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === "POST") {
    const { nombre, descripcion, almacenId } = req.body;
    
    // Validar parámetros requeridos
    if (!nombre || !almacenId) {
      return res.status(400).json({ error: "Nombre y almacenId son requeridos" });
    }
    
    const almacen = await prisma.almacen.findUnique({
      where: {
        id: almacenId,
      },
    });

    // Get the last product code for this warehouse to generate the correlative
    const lastProduct = await prisma.producto.findFirst({
      where: {
        almacenId: almacenId,
        codigo: {
          startsWith: almacen?.nombre.substring(0, 3).toUpperCase() || "",
        },
      },
      orderBy: {
        codigo: "desc",
      },
    });

    // Generate the new code
    const prefix = almacen?.nombre.substring(0, 3).toUpperCase() || "";
    let correlative = 1;

    if (lastProduct) {
      const lastCorrelative = parseInt(lastProduct.codigo.split("-")[1]);
      correlative = lastCorrelative + 1;
    }

    const newCode = `${prefix}-${correlative.toString().padStart(5, "0")}`;
    try {
      const producto = await prisma.producto.create({
        data: {
          codigo: newCode,
          nombre,
          descripcion: descripcion || "",
          almacenId,
        },
      });
      return res.status(201).json(producto);
    } catch (error) {
      return res.status(500).json({ error: "Error al crear producto" });
    }
  }

  // Método no permitido
  res.setHeader("Allow", ["GET", "POST", "OPTIONS"]);
  return res.status(405).json({ error: `Método ${req.method} no permitido` });
}
