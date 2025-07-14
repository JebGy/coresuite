"use client";
import { addMovimiento } from "@/app/actions/MovimientosActions";
import { addProudcto, getProductos } from "@/app/actions/ProductosActions";
import { KardexRow, Movimiento, Producto } from "@/types";
import { randomInt, randomUUID } from "crypto";
import React, { useEffect, useState } from "react";

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
  const [productoForm, setProductoForm] = useState({
    codigo: "",
    nombre: "",
    descripcion: "",
    almacenId: 0,
  });
  const [movimientoForm, setMovimientoForm] = useState({
    tipo: "entrada" as "entrada" | "salida",
    fecha: new Date().toISOString().slice(0, 10),
    cantidad: 0,
    precioUnitario: 0,
    motivo: "",
    productoId: 0,
    almacenId: 0,
  });

  //Efectos
  useEffect(() => {
    getProductos().then((v) => {
      setProductos(v);
    });
  }, []);

  // Handlers para productos
  const handleProductoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.name === 'almacenId' ? Number(e.target.value) : e.target.value;
    setProductoForm({ ...productoForm, [e.target.name]: value });
  };
  const handleProductoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productoForm.codigo || !productoForm.nombre) return;
    try {
      addProudcto({
        id: 0,
        codigo: productoForm.codigo,
        nombre: productoForm.nombre,
        descripcion: productoForm.descripcion,
        almacenId: productoForm.almacenId || undefined,
      });
    } catch (error) {
      alert("Error al guardar el producto");
    }
  };

  // Handlers para movimientos
  const handleMovimientoChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setMovimientoForm({ ...movimientoForm, [e.target.name]: e.target.value });
  };
  const handleMovimientoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !movimientoForm.productoId ||
      !movimientoForm.cantidad ||
      !movimientoForm.fecha
    )
      return;
    try {
      await addMovimiento({
        cantidad: Number(movimientoForm.cantidad),
        precioUnitario:
          movimientoForm.tipo === "entrada"
            ? Number(movimientoForm.precioUnitario)
            : undefined,
        productoId: Number(movimientoForm.productoId),
        fecha: movimientoForm.fecha,
        tipo: movimientoForm.tipo as "entrada" | "salida",
        motivo: movimientoForm.motivo,
        almacenId: Number(movimientoForm.almacenId),
      });
      // Refrescar productos después de agregar movimiento
      getProductos().then((v) => {
        setProductos(v);
      });
      setMovimientoForm({
        ...movimientoForm,
        cantidad: 0,
        precioUnitario: 0,
        motivo: "",
      });
    } catch (error) {
      alert("Error al guardar el movimiento");
    }
  };

  // Producto seleccionado para mostrar Kardex
  const [productoSeleccionado, setProductoSeleccionado] = useState<
    number | null
  >(null);
  const movimientosFiltrados = movimientos.filter(
    (m) => m.productoId === productoSeleccionado
  );
  const kardex = calcularKardex(movimientosFiltrados);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Sistema Kardex - Nuevo Registro
          </h1>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Formulario de productos */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Registrar Producto</h2>
              <form onSubmit={handleProductoSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Código del producto
                  </label>
                  <input
                    name="codigo"
                    placeholder="Código"
                    value={productoForm.codigo}
                    onChange={handleProductoChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del producto
                  </label>
                  <input
                    name="nombre"
                    placeholder="Nombre"
                    value={productoForm.nombre}
                    onChange={handleProductoChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción (opcional)
                  </label>
                  <input
                    name="descripcion"
                    placeholder="Descripción"
                    value={productoForm.descripcion}
                    onChange={handleProductoChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Almacén (opcional)
                  </label>
                  <select
                    name="almacenId"
                    value={productoForm.almacenId}
                    onChange={handleProductoChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                  >
                    <option value="0">Sin asignar</option>
                    {/* Aquí se mostrarían los almacenes si estuvieran disponibles */}
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
                >
                  Agregar Producto
                </button>
              </form>
            </div>

            {/* Formulario de movimientos */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Registrar Movimiento</h2>
              <form onSubmit={handleMovimientoSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Producto
                  </label>
                  <select
                    name="productoId"
                    value={movimientoForm.productoId}
                    onChange={handleMovimientoChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                    required
                  >
                    <option value="">Selecciona un producto</option>
                    {productos.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre} ({p.codigo})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Almacén
                  </label>
                  <select
                    name="almacenId"
                    value={movimientoForm.almacenId}
                    onChange={handleMovimientoChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                    required
                  >
                    <option value="">Selecciona un almacén</option>
                    {/* Aquí se mostrarían los almacenes si estuvieran disponibles */}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de movimiento
                  </label>
                  <select
                    name="tipo"
                    value={movimientoForm.tipo}
                    onChange={handleMovimientoChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                  >
                    <option value="entrada">Entrada</option>
                    <option value="salida">Salida</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha del movimiento
                  </label>
                  <input
                    name="fecha"
                    type="date"
                    value={movimientoForm.fecha}
                    onChange={handleMovimientoChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cantidad
                  </label>
                  <input
                    name="cantidad"
                    type="number"
                    min={1}
                    value={movimientoForm.cantidad}
                    onChange={handleMovimientoChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                    placeholder="Cantidad"
                    required
                  />
                </div>
                {movimientoForm.tipo === "entrada" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Precio unitario (solo para entradas)
                    </label>
                    <input
                      name="precioUnitario"
                      type="number"
                      min={0}
                      step={0.01}
                      value={movimientoForm.precioUnitario}
                      onChange={handleMovimientoChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                      placeholder="Precio unitario"
                      required
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Motivo o detalle del movimiento
                  </label>
                  <input
                    name="motivo"
                    placeholder="Motivo"
                    value={movimientoForm.motivo}
                    onChange={handleMovimientoChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
                >
                  Agregar Movimiento
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Selección de producto para ver Kardex */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Visualizar Kardex</h2>
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Ver Kardex de:</label>
            <select
              value={productoSeleccionado ?? ""}
              onChange={(e) =>
                setProductoSeleccionado(Number(e.target.value) || null)
              }
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
            >
              <option value="">Selecciona un producto</option>
              {productos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre} ({p.codigo})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tabla Kardex */}
        {productoSeleccionado && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Kardex del Producto</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Detalle</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Entradas</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Salidas</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Saldo (Unidades)</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Saldo (Valor)</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Costo Promedio</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {kardex.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.fecha}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.detalle}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{row.entrada}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{row.salida}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {row.saldoCantidad}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        ${row.saldoValor.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        ${row.costoPromedio.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  {kardex.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">
                        No hay movimientos para este producto.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
