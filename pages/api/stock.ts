import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

type ProductoConStock = {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  almacenId?: number;
  almacenNombre?: string;
  stock: number;
  valorInventario: number;
  costoPromedio: number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Configurar headers CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  
  // Implementar cache para optimizar rendimiento
  res.setHeader("Cache-Control", "public, s-maxage=30, stale-while-revalidate=60");
  
  // Manejar preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Solo permitir GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Obtener todos los productos con sus almacenes
    const productos = await prisma.producto.findMany({
      include: {
        almacen: {
          select: {
            id: true,
            nombre: true
          }
        },
        movimientos: {
          select: {
            tipo: true,
            cantidad: true,
            precioUnitario: true,
            fecha: true
          },
          orderBy: {
            fecha: 'asc'
          }
        }
      }
    });

    // Calcular stock para cada producto
    const productosConStock: ProductoConStock[] = productos.map(producto => {
      let stock = 0;
      let valorTotal = 0;
      let costoPromedio = 0;
      
      // Calcular stock y valor basado en movimientos
      for (const movimiento of producto.movimientos) {
        // Validar datos del movimiento
        if (!movimiento.cantidad || movimiento.cantidad <= 0) {
          continue; // Saltar movimientos con cantidad inválida
        }
        
        const precio = movimiento.precioUnitario || 0;
        
        if (movimiento.tipo === 'entrada') {
          stock += movimiento.cantidad;
          valorTotal += movimiento.cantidad * precio;
          // Recalcular costo promedio después de entrada
          costoPromedio = stock > 0 ? valorTotal / stock : 0;
        } else if (movimiento.tipo === 'salida') {
          // Para salidas, usar el costo promedio actual antes de la salida
          const cantidadSalida = Math.min(movimiento.cantidad, stock); // No permitir salidas mayores al stock
          stock -= cantidadSalida;
          valorTotal -= cantidadSalida * costoPromedio;
          // El costo promedio se mantiene igual después de una salida
        }
      }
      
      // Asegurar que el stock no sea negativo y manejar casos edge
      stock = Math.max(0, stock);
      valorTotal = Math.max(0, valorTotal);
      
      // Recalcular costo promedio final para evitar inconsistencias
      if (stock > 0 && valorTotal > 0) {
        costoPromedio = valorTotal / stock;
      } else {
        costoPromedio = 0;
      }
      
      return {
        id: producto.id,
        codigo: producto.codigo,
        nombre: producto.nombre,
        descripcion: producto.descripcion || undefined,
        almacenId: producto.almacenId || undefined,
        almacenNombre: producto.almacen?.nombre || undefined,
        stock: Math.round(stock), // Asegurar que el stock sea un entero
        valorInventario: Math.round(valorTotal * 100) / 100, // Redondear a 2 decimales
        costoPromedio: Math.round(costoPromedio * 100) / 100 // Redondear a 2 decimales
      };
    });

    // Filtrar productos que tienen stock o que han tenido movimientos
    const productosConMovimientos = productosConStock.filter(producto => {
      const productoOriginal = productos.find(p => p.id === producto.id);
      return producto.stock > 0 || (productoOriginal?.movimientos.length ?? 0) > 0;
    });

    // Ordenar por stock descendente
    productosConMovimientos.sort((a, b) => b.stock - a.stock);

    res.status(200).json({
      success: true,
      data: productosConMovimientos,
      total: productosConMovimientos.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error al obtener stock de productos:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al obtener el stock de productos'
    });
  }
}