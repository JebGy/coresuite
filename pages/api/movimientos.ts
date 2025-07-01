import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { calcularKardex } from '../../lib/kardex';
const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { productoId } = req.query;
    const movimientos = await prisma.movimiento.findMany({
      where: { productoId: Number(productoId) },
      orderBy: { fecha: 'asc' }
    });
    // Calcula el Kardex
    const kardex = calcularKardex(movimientos);
    return res.json(kardex);
  }
  if (req.method === 'POST') {
    const { tipo, fecha, cantidad, precioUnitario, motivo, productoId } = req.body;
    const movimiento = await prisma.movimiento.create({
      data: { tipo, fecha: new Date(fecha), cantidad, precioUnitario, motivo, productoId }
    });
    return res.status(201).json(movimiento);
  }
  res.status(405).end();
}