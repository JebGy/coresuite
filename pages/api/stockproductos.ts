import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { Almacen, Movimiento, Producto } from "@/types";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Configuración de CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Manejar solicitudes OPTIONS (preflight)
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method === "GET") {
    const { nombreElemento } = req.query;
    try {
      // Obtener todos los productos
      const productos = await prisma.producto.findMany();

      // Obtener todos los almacenes
      const almacenes = await prisma.almacen.findMany();

      // Obtener todos los movimientos
      const movimientos = await prisma.movimiento.findMany({
        orderBy: {
          fecha: "asc",
        },
      });

      // Calcular el stock para cada producto
      const productosConStock = productos.map((producto) => {
        // Filtrar movimientos por producto
        const movimientosProducto = movimientos.filter(
          (m) => m.productoId === producto.id
        );

        // Calcular stock
        let stock = 0;
        movimientosProducto.forEach((m) => {
          if (m.tipo === "entrada") stock += m.cantidad;
          else stock -= m.cantidad;
        });

        // Encontrar el almacén del producto
        const almacen = almacenes.find((a) => a.id === producto.almacenId);

        return {
          id: producto.id,
          codigo: producto.codigo.toLocaleLowerCase(),
          nombre: producto.nombre.toLocaleLowerCase(),
          descripcion: producto.descripcion?.toLocaleLowerCase() || "-",
          almacenId: producto.almacenId,
          almacenNombre: almacen?.nombre || "-",
          stockTotal: stock,
          estado: "Activo",
        };
      });

      return res.status(200).json({
        success: true,
        data: productosConStock.filter(
          (p) =>
            p.nombre.toLowerCase().includes((nombreElemento as string).toLowerCase()) ||
            p.descripcion.toLowerCase().includes(
              (nombreElemento as string).toLowerCase()
            )
        ),
      });
    } catch (error) {
      console.error("Error al obtener stock de productos:", error);
      return res.status(500).json({
        success: false,
        error: "Error al obtener el stock de productos",
      });
    }
  }

  // Método no permitido
  res.setHeader("Allow", ["GET", "OPTIONS"]);
  return res.status(405).json({ error: `Método ${req.method} no permitido` });
}
