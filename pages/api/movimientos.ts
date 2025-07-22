import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { calcularKardex } from '../../lib/kardex';
import { Movimiento } from '@/types';
const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { productoId } = req.query;
    // Adaptar el tipo de fecha a string para cumplir con el tipo Movimiento
    const movimientosRaw = await prisma.movimiento.findMany({
      where: { productoId: Number(productoId) },
      orderBy: { fecha: 'asc' }
    });
    const movimientos: Movimiento[] = movimientosRaw.map((m) => ({
      ...m,
      fecha: m.fecha.toISOString().slice(0, 10),
      tipo: m.tipo as "entrada" | "salida",
      precioUnitario: m.precioUnitario === null ? undefined : m.precioUnitario,
    }));
    // Calcula el Kardex
    const kardex = calcularKardex(movimientos );
    return res.json(kardex);
  }
  if (req.method === 'POST') {
    const { tipo, fecha, cantidad, precioUnitario, motivo, productoId, almacenId } = req.body;
    const movimiento = await prisma.movimiento.create({
      data: {
        tipo,
        fecha: new Date(fecha),
        cantidad,
        precioUnitario,
        motivo,
        producto: { connect: { id: productoId } },
        almacen: { connect: { id: almacenId } }, // Debes obtener almacenId del body
      }
    });
    return res.status(201).json(movimiento);
  }
  res.status(405).end();
}