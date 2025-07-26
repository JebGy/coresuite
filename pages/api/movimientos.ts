import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { calcularKardex } from "../../lib/kardex";
import { Movimiento } from "@/types";
const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  if (req.method === "POST") {
    const { tipo, cantidad, precioUnitario, productoId, almacenId } = req.body;

    // Convertir IDs a números
    const productoIdInt = parseInt(productoId, 10);
    const almacenIdInt = parseInt(almacenId, 10);

    const movimiento = await prisma.movimiento.create({
      data: {
        tipo,
        fecha: new Date(),
        cantidad,
        precioUnitario,
        motivo: "REGISTRO INICIAL",
        producto: { connect: { id: productoIdInt } },
        almacen: { connect: { id: almacenIdInt } },
      },
    });
    return res.status(201).json(movimiento);
  }
  res.status(405).end();
}
