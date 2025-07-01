export type Producto = {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
};

export type Movimiento = {
  id: number;
  tipo: "entrada" | "salida";
  fecha: Date;
  cantidad: number;
  precioUnitario?: number;
  motivo: string;
  productoId: number;
};

export type KardexRow = {
    fecha: string;
    detalle: string;
    entrada: number;
    salida: number;
    saldoCantidad: number;
    saldoValor: number;
    costoPromedio: number;
  };