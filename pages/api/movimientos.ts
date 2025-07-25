import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { calcularKardex } from '../../lib/kardex';
import { Movimiento } from '@/types';
const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { productoId } = req.query;
    // Convertir productoId a número
    const productoIdInt = parseInt(productoId as string, 10);
    
    // Adaptar el tipo de fecha a string para cumplir con el tipo Movimiento
    const movimientosRaw = await prisma.movimiento.findMany({
      where: { productoId: productoIdInt },
      orderBy: { fecha: 'asc' }
    });
    // Solución: Convertir null a undefined para 'precioUnitario' y 'factura', y null a undefined para 'ordenEntregaId'
    const movimientos: Movimiento[] = movimientosRaw.map((m) => ({
      id: m.id,
      tipo: m.tipo as "entrada" | "salida",
      fecha: m.fecha.toISOString().slice(0, 10),
      cantidad: m.cantidad,
      precioUnitario: m.precioUnitario === null ? undefined : m.precioUnitario,
      motivo: m.motivo,
      factura: m.factura === null ? undefined : m.factura,
      productoId: m.productoId,
      almacenId: m.almacenId,
      ordenEntregaId: m.ordenEntregaId === null ? undefined : m.ordenEntregaId,
    }));
    // Calcula el Kardex
    const kardex = calcularKardex(movimientos );
    return res.json(kardex);
  }
  if (req.method === 'POST') {
    const { tipo, fecha, cantidad, precioUnitario, motivo, productoId, almacenId } = req.body;
    
    // Convertir IDs a números
    const productoIdInt = parseInt(productoId, 10);
    const almacenIdInt = parseInt(almacenId, 10);
    
    const movimiento = await prisma.movimiento.create({
      data: {
        tipo,
        fecha: new Date(fecha),
        cantidad,
        precioUnitario,
        motivo,
        producto: { connect: { id: productoIdInt } },
        almacen: { connect: { id: almacenIdInt } },
      }
    });
    return res.status(201).json(movimiento);
  }
  res.status(405).end();
}