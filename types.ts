export type Producto = {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  almacenId?: number;
};

export type Almacen = {
  id: number;
  nombre: string;
  ubicacion?: string;
  descripcion?: string;
  unidadId?: number;
};

export type Unidad = {
  id: number;
  nombre: string;
  descripcion?: string;
};

export type Trabajador = {
  id: number;
  dni: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  unidadId: number;
  unidad?: Unidad;
  createdAt: string;
  updatedAt: string;
};

export type OrdenEntrega = {
  id: number;
  numeroTicket: string;
  fechaSolicitud: string;
  fechaAprobacion?: string;
  estado: 'pendiente' | 'aprobada' | 'rechazada' | 'entregada';
  cantidad: number;
  motivo: string;
  observaciones?: string;
  trabajadorId: number;
  trabajador?: Trabajador;
  productoId: number;
  producto?: Producto;
  almacenId: number;
  almacen?: Almacen;
  createdAt: string;
  updatedAt: string;
};

export type Movimiento = {
  id: number;
  tipo: "entrada" | "salida";
  fecha: string;
  cantidad: number;
  precioUnitario?: number;
  motivo: string;
  factura?: string;
  productoId: number;
  almacenId: number;
  ordenEntregaId?: number;
};

export type KardexRow = {
    fecha: string;
    detalle: string;
    entrada: number;
    salida: number;
    saldoCantidad: number;
    saldoValor: number;
    costoPromedio: number;
    almacenId?: number;
    almacenNombre?: string;
    factura?: string;
  };

export type KardexConsolidado = {
  productoId: number;
  productoNombre: string;
  productoCodigo: string;
  almacenes: {
    almacenId: number;
    almacenNombre: string;
    saldoCantidad: number;
    saldoValor: number;
    costoPromedio: number;
  }[];
  totalCantidad: number;
  totalValor: number;
};

export type Rol = {
  id: number;
  nombre: string;
  descripcion?: string;
  permisos: any;
};