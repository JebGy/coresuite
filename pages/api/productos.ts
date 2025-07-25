import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { nombre, descripcion, almacenId } = req.body;
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
    console.log(newCode, nombre, descripcion);
    try {
      console.log(newCode, nombre, descripcion);
      const producto = await prisma.producto.create({
        data: {
          codigo: newCode,
          nombre,
          descripcion,
          almacenId,
        },
      });
      res.status(201).json(producto);
    } catch {
      res.status(500).json({ error: "Error al crear producto" });
    }
  }
  // ... otros métodos (GET, etc) ...
}
