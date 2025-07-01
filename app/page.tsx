"use client"
import React, { useState } from "react";

// Tipos de datos
interface Producto {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
}

interface Movimiento {
  id: number;
  tipo: "entrada" | "salida";
  fecha: string;
  cantidad: number;
  precioUnitario?: number;
  motivo: string;
  productoId: number;
}

interface KardexRow {
  fecha: string;
  detalle: string;
  entrada: number;
  salida: number;
  saldoCantidad: number;
  saldoValor: number;
  costoPromedio: number;
}

// Lógica de Kardex
function calcularKardex(movimientos: Movimiento[]): KardexRow[] {
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
        fecha: mov.fecha,
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
        fecha: mov.fecha,
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

export default function Home() {
  // Estados para productos y movimientos
  const [productos, setProductos] = useState<Producto[]>([]);
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [productoForm, setProductoForm] = useState({ codigo: "", nombre: "", descripcion: "" });
  const [movimientoForm, setMovimientoForm] = useState({
    tipo: "entrada" as "entrada" | "salida",
    fecha: new Date().toISOString().slice(0, 10),
    cantidad: 0,
    precioUnitario: 0,
    motivo: "",
    productoId: 0,
  });

  // Handlers para productos
  const handleProductoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProductoForm({ ...productoForm, [e.target.name]: e.target.value });
  };
  const handleProductoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productoForm.codigo || !productoForm.nombre) return;
    setProductos([
      ...productos,
      {
        id: productos.length + 1,
        codigo: productoForm.codigo,
        nombre: productoForm.nombre,
        descripcion: productoForm.descripcion,
      },
    ]);
    setProductoForm({ codigo: "", nombre: "", descripcion: "" });
  };

  // Handlers para movimientos
  const handleMovimientoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setMovimientoForm({ ...movimientoForm, [e.target.name]: e.target.value });
  };
  const handleMovimientoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!movimientoForm.productoId || !movimientoForm.cantidad || !movimientoForm.fecha) return;
    setMovimientos([
      ...movimientos,
      {
        id: movimientos.length + 1,
        tipo: movimientoForm.tipo,
        fecha: movimientoForm.fecha,
        cantidad: Number(movimientoForm.cantidad),
        precioUnitario: movimientoForm.tipo === "entrada" ? Number(movimientoForm.precioUnitario) : undefined,
        motivo: movimientoForm.motivo,
        productoId: Number(movimientoForm.productoId),
      },
    ]);
    setMovimientoForm({
      ...movimientoForm,
      cantidad: 0,
      precioUnitario: 0,
      motivo: "",
    });
  };

  // Producto seleccionado para mostrar Kardex
  const [productoSeleccionado, setProductoSeleccionado] = useState<number | null>(null);
  const movimientosFiltrados = movimientos.filter((m) => m.productoId === productoSeleccionado);
  const kardex = calcularKardex(movimientosFiltrados);

  return (
    <div className="grid items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <h1 className="text-2xl font-bold mb-4">Sistema Kardex (Demo en memoria)</h1>
      {/* Formulario de productos */}
      <form onSubmit={handleProductoSubmit} className="mb-8 p-4 border rounded flex flex-col gap-2 w-full max-w-md">
        <h2 className="font-semibold">Registrar producto</h2>
        <label className="flex flex-col">
          Código del producto
          <input name="codigo" placeholder="Código" value={productoForm.codigo} onChange={handleProductoChange} className="border p-1" required />
        </label>
        <label className="flex flex-col">
          Nombre del producto
          <input name="nombre" placeholder="Nombre" value={productoForm.nombre} onChange={handleProductoChange} className="border p-1" required />
        </label>
        <label className="flex flex-col">
          Descripción (opcional)
          <input name="descripcion" placeholder="Descripción" value={productoForm.descripcion} onChange={handleProductoChange} className="border p-1" />
        </label>
        <button type="submit" className="bg-blue-600 text-white rounded p-2 mt-2">Agregar producto</button>
      </form>

      {/* Formulario de movimientos */}
      <form onSubmit={handleMovimientoSubmit} className="mb-8 p-4 border rounded flex flex-col gap-2 w-full max-w-md">
        <h2 className="font-semibold">Registrar movimiento</h2>
        <label className="flex flex-col">
          Producto
          <select name="productoId" value={movimientoForm.productoId} onChange={handleMovimientoChange} className="border p-1" required>
            <option value="">Selecciona un producto</option>
            {productos.map((p) => (
              <option key={p.id} value={p.id}>{p.nombre} ({p.codigo})</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col">
          Tipo de movimiento
          <select name="tipo" value={movimientoForm.tipo} onChange={handleMovimientoChange} className="border p-1">
            <option value="entrada">Entrada</option>
            <option value="salida">Salida</option>
          </select>
        </label>
        <label className="flex flex-col">
          Fecha del movimiento
          <input name="fecha" type="date" value={movimientoForm.fecha} onChange={handleMovimientoChange} className="border p-1" required />
        </label>
        <label className="flex flex-col">
          Cantidad
          <input name="cantidad" type="number" min={1} value={movimientoForm.cantidad} onChange={handleMovimientoChange} className="border p-1" placeholder="Cantidad" required />
        </label>
        {movimientoForm.tipo === "entrada" && (
          <label className="flex flex-col">
            Precio unitario (solo para entradas)
            <input name="precioUnitario" type="number" min={0} step={0.01} value={movimientoForm.precioUnitario} onChange={handleMovimientoChange} className="border p-1" placeholder="Precio unitario" required />
          </label>
        )}
        <label className="flex flex-col">
          Motivo o detalle del movimiento
          <input name="motivo" placeholder="Motivo" value={movimientoForm.motivo} onChange={handleMovimientoChange} className="border p-1" required />
        </label>
        <button type="submit" className="bg-green-600 text-white rounded p-2 mt-2">Agregar movimiento</button>
      </form>

      {/* Selección de producto para ver Kardex */}
      <div className="mb-8">
        <label className="mr-2">Ver Kardex de:</label>
        <select value={productoSeleccionado ?? ""} onChange={e => setProductoSeleccionado(Number(e.target.value) || null)} className="border p-1">
          <option value="">Selecciona un producto</option>
          {productos.map((p) => (
            <option key={p.id} value={p.id}>{p.nombre} ({p.codigo})</option>
          ))}
        </select>
      </div>

      {/* Tabla Kardex */}
      {productoSeleccionado && (
        <div className="overflow-x-auto w-full max-w-3xl">
          <table className="min-w-full border text-sm">
            <thead>
              <tr>
                <th className="border px-2">Fecha</th>
                <th className="border px-2">Detalle</th>
                <th className="border px-2">Entradas</th>
                <th className="border px-2">Salidas</th>
                <th className="border px-2">Saldo (Unidades)</th>
                <th className="border px-2">Saldo (Valor)</th>
                <th className="border px-2">Costo Promedio</th>
              </tr>
            </thead>
            <tbody>
              {kardex.map((row, i) => (
                <tr key={i}>
                  <td className="border px-2">{row.fecha}</td>
                  <td className="border px-2">{row.detalle}</td>
                  <td className="border px-2 text-right">{row.entrada}</td>
                  <td className="border px-2 text-right">{row.salida}</td>
                  <td className="border px-2 text-right">{row.saldoCantidad}</td>
                  <td className="border px-2 text-right">{row.saldoValor.toFixed(2)}</td>
                  <td className="border px-2 text-right">{row.costoPromedio.toFixed(2)}</td>
                </tr>
              ))}
              {kardex.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center p-4">No hay movimientos para este producto.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
