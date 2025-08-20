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

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type Traslado = {
  id: number;
  numeroGuia: string;
  producto: {
    id: number;
    nombre: string;
  };
  almacenOrigen: {
    id: number;
    nombre: string;
  };
  almacenDestino: {
    id: number;
    nombre: string;
  };
  cantidad: number;
  estado: "PENDIENTE" | "APROBADO" | "RECHAZADO" | "COMPLETADO";
  observaciones?: string;
  trabajadorId: number;
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
  rol?: Rol;
};

export type UsuarioSession = {
  id: number;
  nombres: string;
  apellidos: string;
  email: string;
  rolId: number;
  rol?: Rol;
};

export type OrdenEntrega = {
  id: number;
  numeroTicket: string;
  fechaSolicitud: string;
  fechaAprobacion?: string;
  estado: "pendiente" | "aprobada" | "rechazada" | "entregada";
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
  permisos: Permiso;
};

export interface Permiso {
  accesoTotal: boolean;
  puedeCrearOrdenes: boolean;
  puedeEditarUsuarios: boolean;
  puedeGestionarInventario: boolean;
  puedeVerReportes: boolean;
}

export type Notificacion = {
  id: number;
  tipo: string;
  mensaje: string;
  leida: boolean;
  origen: string;
  datos?: string;
  createdAt: string;
  updatedAt: string;
};

export type Segmento = {
  id: number;
  nombre: string;
  descripcion?: string;
  createdAt: string;
  updatedAt: string;
};

export type Proveedor = {
  id: number;
  ruc: string;
  nombre: string;
  telefono?: string;
  email?: string;
  detalles?: string;  // Nuevo campo opcional
  segmentoId: number;
  segmento?: Segmento;
  createdAt: string;
  updatedAt: string;
};