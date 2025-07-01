import { KardexRow, Movimiento } from "@/types";

export function calcularKardex(movimientos: Movimiento[]): KardexRow[] {
  let saldoCantidad = 0;
  let saldoValor = 0;
  let costoPromedio = 0;
  const kardex: KardexRow[] = [];

  movimientos.forEach((mov) => {
    if (mov.tipo === "entrada") {
      const valorEntrada = mov.cantidad * (mov.precioUnitario ?? 0);
      saldoCantidad += mov.cantidad;
      saldoValor += valorEntrada;
      costoPromedio = saldoCantidad ? saldoValor / saldoCantidad : 0;
      kardex.push({
        fecha: mov.fecha.toString(),
        detalle: mov.motivo,
        entrada: mov.cantidad,
        salida: 0,
        saldoCantidad,
        saldoValor,
        costoPromedio,
      });
    } else {
      const valorSalida = mov.cantidad * costoPromedio;
      saldoCantidad -= mov.cantidad;
      saldoValor -= valorSalida;
      kardex.push({
        fecha: mov.fecha.toString(),
        detalle: mov.motivo,
        entrada: 0,
        salida: mov.cantidad,
        saldoCantidad,
        saldoValor,
        costoPromedio,
      });
    }
  });

  return kardex;
}
