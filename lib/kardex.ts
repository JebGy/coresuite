import { KardexRow, Movimiento, Almacen, KardexConsolidado, Producto } from "@/types";

export function calcularKardex(movimientos: Movimiento[], almacenes: Almacen[] = []): KardexRow[] {
  let saldoCantidad = 0;
  let saldoValor = 0;
  let costoPromedio = 0;
  const kardex: KardexRow[] = [];

  movimientos.forEach((mov) => {
    const almacen = almacenes.find(a => a.id === mov.almacenId);
    
    if (mov.tipo === "entrada") {
      const valorEntrada = mov.cantidad * (mov.precioUnitario ?? 0);
      saldoCantidad += mov.cantidad;
      saldoValor += valorEntrada;
      costoPromedio = saldoCantidad ? saldoValor / saldoCantidad : 0;
      kardex.push({
        fecha: mov.fecha,
        detalle: mov.motivo,
        entrada: mov.cantidad,
        salida: 0,
        saldoCantidad,
        saldoValor,
        costoPromedio,
        almacenId: mov.almacenId,
        almacenNombre: almacen?.nombre,
        factura: mov.factura,
      });
    } else {
      const valorSalida = mov.cantidad * costoPromedio;
      saldoCantidad -= mov.cantidad;
      saldoValor -= valorSalida;
      kardex.push({
        fecha: mov.fecha,
        detalle: mov.motivo,
        entrada: 0,
        salida: mov.cantidad,
        saldoCantidad,
        saldoValor,
        costoPromedio,
        almacenId: mov.almacenId,
        almacenNombre: almacen?.nombre,
        factura: undefined,
      });
    }
  });

  return kardex;
}

export function calcularKardexPorAlmacen(
  movimientos: Movimiento[], 
  almacenId: number, 
  almacenes: Almacen[]
): KardexRow[] {
  const movimientosAlmacen = movimientos.filter(m => m.almacenId === almacenId);
  return calcularKardex(movimientosAlmacen, almacenes);
}

export function calcularKardexConsolidado(
  movimientos: Movimiento[], 
  productos: Producto[] | null | undefined, 
  almacenes: Almacen[]
): KardexConsolidado[] {
  const consolidado: KardexConsolidado[] = [];
  
  // Return empty array if productos is not a valid array
  if (!Array.isArray(productos)) {
    return [];
  }

  // Agrupar movimientos por producto
  const movimientosPorProducto = new Map<number, Movimiento[]>();
  
  movimientos.forEach(mov => {
    if (!movimientosPorProducto.has(mov.productoId)) {
      movimientosPorProducto.set(mov.productoId, []);
    }
    movimientosPorProducto.get(mov.productoId)!.push(mov);
  });

  // Calcular kardex para cada producto
  movimientosPorProducto.forEach((movsProducto, productoId) => {
    const producto = productos.find(p => p.id === productoId);
    if (!producto) return;

    // Agrupar movimientos por almacén
    const movimientosPorAlmacen = new Map<number, Movimiento[]>();
    
    movsProducto.forEach(mov => {
      if (!movimientosPorAlmacen.has(mov.almacenId)) {
        movimientosPorAlmacen.set(mov.almacenId, []);
      }
      movimientosPorAlmacen.get(mov.almacenId)!.push(mov);
    });

    const almacenesInfo: KardexConsolidado['almacenes'] = [];
    let totalCantidad = 0;
    let totalValor = 0;

    // Calcular saldos por almacén
    movimientosPorAlmacen.forEach((movsAlmacen, almacenId) => {
      const almacen = almacenes.find(a => a.id === almacenId);
      if (!almacen) return;

      let saldoCantidad = 0;
      let saldoValor = 0;
      let costoPromedio = 0;

      movsAlmacen.forEach(mov => {
        if (mov.tipo === "entrada") {
          const valorEntrada = mov.cantidad * (mov.precioUnitario ?? 0);
          saldoCantidad += mov.cantidad;
          saldoValor += valorEntrada;
          costoPromedio = saldoCantidad ? saldoValor / saldoCantidad : 0;
        } else {
          const valorSalida = mov.cantidad * costoPromedio;
          saldoCantidad -= mov.cantidad;
          saldoValor -= valorSalida;
        }
      });

      almacenesInfo.push({
        almacenId,
        almacenNombre: almacen.nombre,
        saldoCantidad,
        saldoValor,
        costoPromedio,
      });

      totalCantidad += saldoCantidad;
      totalValor += saldoValor;
    });

    consolidado.push({
      productoId,
      productoNombre: producto.nombre,
      productoCodigo: producto.codigo,
      almacenes: almacenesInfo,
      totalCantidad,
      totalValor,
    });
  });

  return consolidado;
}
