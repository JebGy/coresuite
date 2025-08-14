import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Configuración de CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Manejar solicitudes OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    const { ruc, nombre, telefono, email } = req.body;
    
    // Validar parámetros requeridos
    if (!ruc || !nombre) {
      return res.status(400).json({ error: "RUC y nombre son requeridos" });
    }
    
    try {
      // Verificar si el RUC ya existe
      const proveedorExistente = await prisma.proveedor.findUnique({
        where: { ruc }
      });
      
      if (proveedorExistente) {
        return res.status(400).json({ error: "Ya existe un proveedor con este RUC" });
      }

      const nuevoProveedor = await prisma.proveedor.create({
        data: {
          ruc,
          nombre,
          telefono: telefono || null,
          email: email || null,
        },
      });
      
      return res.status(201).json(nuevoProveedor);
    } catch (error) {
      console.error('Error al crear proveedor:', error);
      return res.status(500).json({ error: 'Error al crear proveedor' });
    }
  }

  return res.status(405).json({ error: 'Método no permitido' });
}