import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { codigo, nombre, descripcion } = req.body;
    console.log(codigo, nombre, descripcion);
    try {
      console.log(codigo, nombre, descripcion);
      const producto = await prisma.producto.create({
        data: { codigo, nombre, descripcion },
      });
      res.status(201).json(producto);
    } catch {
      res.status(500).json({ error: "Error al crear producto" });
    }
  }
  // ... otros métodos (GET, etc) ...
}
