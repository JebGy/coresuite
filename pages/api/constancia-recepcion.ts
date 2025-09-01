import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { Almacen, Movimiento, Producto, Proveedor } from "@/types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const { movimientoId, proveedorId, numeroGuia, agenciaTransporte, numeroGuiaAgencia, observaciones } = req.body;

    if (!movimientoId) {
      return res.status(400).json({ error: "ID de movimiento requerido" });
    }

    if (!proveedorId) {
      return res.status(400).json({ error: "ID de proveedor requerido" });
    }

    // Obtener el movimiento con sus relaciones
    const movimiento = await prisma.movimiento.findUnique({
      where: { id: parseInt(movimientoId) },
      include: {
        producto: true,
        almacen: true,
      },
    });

    if (!movimiento) {
      return res.status(404).json({ error: "Movimiento no encontrado" });
    }

    // Obtener proveedor (requerido)
    const proveedor = await prisma.proveedor.findUnique({
      where: { id: parseInt(proveedorId) },
    });

    if (!proveedor) {
      return res.status(404).json({ error: "Proveedor no encontrado" });
    }

    // Los datos ya están disponibles en las variables movimiento y proveedor

    // Crear registro de constancia en la base de datos
    const constancia = await prisma.constanciaRecepcion.create({
      data: {
        fecha: new Date(),
        horaEntrada: new Date().toLocaleTimeString('es-PE', {
          hour: '2-digit',
          minute: '2-digit'
        }),
        descripcionProducto: `${movimiento.producto.nombre} - ${movimiento.producto.descripcion || ''}`,
        proveedorId: parseInt(proveedorId),
        numeroGuia,
        agenciaTransporte,
        numeroGuiaAgencia,
        observaciones,
        movimientoId: movimiento.id,
      },
    });

    // Devolver los datos de la constancia
    res.status(200).json({
      success: true,
      data: {
        movimiento: {
          ...movimiento,
          producto: movimiento.producto
        },
        proveedor,
        numeroGuia,
        agenciaTransporte,
        numeroGuiaAgencia,
        observaciones,
        constancia: {
          id: constancia.id,
          numero: constancia.numero,
          fecha: constancia.fecha,
        }
      },
    });
  } catch (error) {
    console.error("Error generando constancia:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}