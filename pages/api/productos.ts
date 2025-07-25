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

  // Redirigir parámetros opcionales a POST
  if (req.method === 'GET' && req.query.nombre && req.query.almacenId) {
    req.method = 'POST';
    req.body = {
      nombre: req.query.nombre,
      descripcion: req.query.descripcion || '',
      almacenId: Number(req.query.almacenId)
    };
  }

  if (req.method === "GET") {
    try {
      // Si se proporciona un ID, obtener un producto específico
      if (req.query.id) {
        const producto = await prisma.producto.findUnique({
          where: { id: Number(req.query.id) }
        });
        
        if (!producto) {
          return res.status(404).json({ error: "Producto no encontrado" });
        }
        
        return res.status(200).json(producto);
      }
      
      // Si se proporciona un almacenId, filtrar por almacén
      if (req.query.almacenId) {
        const productos = await prisma.producto.findMany({
          where: { almacenId: Number(req.query.almacenId) }
        });
        
        return res.status(200).json(productos);
      }
      
      // Obtener todos los productos
      const productos = await prisma.producto.findMany();
      return res.status(200).json(productos);
    } catch (error) {
      return res.status(500).json({ error: "Error al obtener productos" });
    }
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
