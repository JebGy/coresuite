"use server";

import { prisma } from "@/lib/prisma";
import { ApiResponse, Producto } from "@/types";
import { registrarLog } from "@/lib/logger";

export async function addProudcto(producto: Producto, usuarioId?: number) {
  // Get the warehouse to generate the prefix
  const almacen = await prisma.almacen.findUnique({
    where: { id: producto.almacenId || 0 },
  });

  if (!almacen) {
    throw new Error('Almacén no encontrado');
  }

  // Get the last product code for this warehouse to generate the correlative
  const lastProduct = await prisma.producto.findFirst({
    where: {
      almacenId: producto.almacenId,
      codigo: {
        startsWith: almacen.nombre.substring(0, 3).toUpperCase(),
      },
    },
    orderBy: {
      codigo: 'desc',
    },
  });

  // Generate the new code
  const prefix = almacen.nombre.substring(0, 3).toUpperCase();
  let correlative = 1;
  
  if (lastProduct) {
    const lastCorrelative = parseInt(lastProduct.codigo.split('-')[1]);
    correlative = lastCorrelative + 1;
  }

  const newCode = `${prefix}-${correlative.toString().padStart(5, '0')}`;

  const nuevoProducto = await prisma.producto.create({
    data: {
      codigo: newCode,
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      almacenId: producto.almacenId || null,
    },
  });
  await registrarLog({
    usuarioId: usuarioId,
    accion: "CREAR",
    entidad: "Producto",
    entidadId: nuevoProducto.id,
    detalles: `Producto creado: ${nuevoProducto.nombre}`,
  });
  console.log("Agregado");
}

export async function updateProducto(producto: Producto, usuarioId?: number) {
  try {
    const productoActualizado = await prisma.producto.update({
      where: { id: producto.id },
      data: {
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        almacenId: producto.almacenId || null,
      },
    });
    
    await registrarLog({
      usuarioId: usuarioId,
      accion: "ACTUALIZAR",
      entidad: "Producto",
      entidadId: productoActualizado.id,
      detalles: `Producto actualizado: ${productoActualizado.nombre}`,
    });
    
    return productoActualizado;
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    throw new Error('Error al actualizar el producto');
  }
}

export async function getProductos(): Promise<ApiResponse<Producto[]>> {
  try {
    const productos = await prisma.producto.findMany({
      include: {
        almacen: true,
      },
    });
    
    const formattedProductos = productos.map((p) => ({
      id: p.id,
      codigo: p.codigo,
      nombre: p.nombre,
      descripcion: p.descripcion === null ? undefined : p.descripcion,
      almacenId: p.almacenId === null ? undefined : p.almacenId,
    }));

    return {
      success: true,
      data: formattedProductos
    };
  } catch (error) {
    console.error('Error al obtener productos:', error);
    return {
      success: false,
      error: 'Error al obtener los productos'
    };
  }
}
