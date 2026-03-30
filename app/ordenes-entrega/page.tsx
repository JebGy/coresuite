"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { OrdenEntrega, ItemOrdenEntrega, Trabajador, Producto, Almacen } from "@/types";
import {
  getOrdenesEntrega,
  createOrdenesEntregaBatch,
  aprobarOrdenEntrega,
  rechazarOrdenEntrega,
} from "@/app/actions/OrdenesEntregaActions";
import { getTrabajadores } from "@/app/actions/TrabajadoresActions";
import { getProductos } from "@/app/actions/ProductosActions";
import { getAlmacenes } from "@/app/actions/AlmacenesActions";
import { useUser } from "@/app/context/UserContext";
import { Notificacion } from "../components/Notificacion";

const ITEM_VACIO: Omit<ItemOrdenEntrega, "almacenNombre"> & { productoInputValue: string; almacenNombre: string } = {
  productoId: 0,
  productoNombre: "",
  productoInputValue: "",
  almacenId: 0,
  almacenNombre: "",
  cantidad: 1,
};

export default function OrdenesEntregaPage() {
  const [ordenes, setOrdenes] = useState<OrdenEntrega[]>([]);
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [almacenes, setAlmacenes] = useState<Almacen[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Campos comunes de la orden
  const [trabajadorId, setTrabajadorId] = useState(0);
  const [trabajadorInputValue, setTrabajadorInputValue] = useState("");
  const [motivo, setMotivo] = useState("");
  const [observaciones, setObservaciones] = useState("");

  // Lista acumulada de ítems
  const [items, setItems] = useState<ItemOrdenEntrega[]>([]);

  // Ítem temporal en edición
  const [itemActual, setItemActual] = useState({ ...ITEM_VACIO });

  const [notificacion, setNotificacion] = useState<{
    mensaje: string;
    tipo?: "exito" | "error" | "info";
  } | null>(null);

  const user = useUser();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [ordenesData, trabajadoresData, productosData, almacenesData] =
        await Promise.all([
          getOrdenesEntrega(),
          getTrabajadores(),
          getProductos(),
          getAlmacenes(),
        ]);
      setOrdenes(ordenesData);
      setTrabajadores(trabajadoresData);
      if (productosData.success && productosData.data) {
        setProductos(productosData.data);
      }
      if (almacenesData.success && almacenesData.data) {
        setAlmacenes(almacenesData.data);
      }
    } catch (error) {
      console.error("Error al cargar datos:", error);
      setNotificacion({ mensaje: "Error al cargar los datos", tipo: "error" });
    } finally {
      setLoading(false);
    }
  };

  // ── Agregar ítem a la lista ──────────────────────────────────────────────
  const handleAgregarItem = () => {
    if (!itemActual.productoId || !itemActual.almacenId) {
      setNotificacion({ mensaje: "Seleccione un producto válido", tipo: "error" });
      return;
    }
    if (itemActual.cantidad <= 0) {
      setNotificacion({ mensaje: "La cantidad debe ser mayor a 0", tipo: "error" });
      return;
    }
    setItems((prev) => [
      ...prev,
      {
        productoId: itemActual.productoId,
        productoNombre: itemActual.productoNombre,
        almacenId: itemActual.almacenId,
        almacenNombre: itemActual.almacenNombre,
        cantidad: itemActual.cantidad,
      },
    ]);
    setItemActual({ ...ITEM_VACIO });
  };

  const handleEliminarItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Enviar la orden completa ─────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!trabajadorId) {
      setNotificacion({ mensaje: "Debe seleccionar un trabajador", tipo: "error" });
      return;
    }
    if (!motivo.trim()) {
      setNotificacion({ mensaje: "El motivo es obligatorio", tipo: "error" });
      return;
    }
    if (items.length === 0) {
      setNotificacion({ mensaje: "Agregue al menos un ítem antes de crear la orden", tipo: "error" });
      return;
    }

    setSubmitting(true);
    try {
      await createOrdenesEntregaBatch(
        {
          trabajadorId,
          trabajadorNombre: trabajadorInputValue,
          motivo,
          observaciones: observaciones || undefined,
          items,
        },
        user.id
      );
      setNotificacion({
        mensaje: `${items.length} orden(es) de entrega creada(s) correctamente`,
        tipo: "exito",
      });
      cancelForm();
      loadData();
    } catch (error) {
      console.error("Error al crear órdenes de entrega:", error);
      setNotificacion({ mensaje: "Error al crear las órdenes de entrega", tipo: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAprobar = async (id: number) => {
    if (!confirm("¿Está seguro de que desea aprobar esta orden de entrega?")) return;
    try {
      await aprobarOrdenEntrega(id, user.id);
      setNotificacion({ mensaje: "Orden de entrega aprobada correctamente", tipo: "exito" });
      loadData();
    } catch (error) {
      console.error("Error al aprobar orden:", error);
      setNotificacion({
        mensaje: error instanceof Error ? error.message : "Error al aprobar la orden",
        tipo: "error",
      });
    }
  };

  const handleRechazar = async (id: number) => {
    const motivoRechazo = prompt("Ingrese el motivo del rechazo:");
    if (!motivoRechazo) return;
    try {
      await rechazarOrdenEntrega(id, motivoRechazo, user.id);
      setNotificacion({ mensaje: "Orden de entrega rechazada correctamente", tipo: "exito" });
      loadData();
    } catch (error) {
      console.error("Error al rechazar orden:", error);
      setNotificacion({ mensaje: "Error al rechazar la orden", tipo: "error" });
    }
  };

  const cancelForm = () => {
    setShowForm(false);
    setTrabajadorId(0);
    setTrabajadorInputValue("");
    setMotivo("");
    setObservaciones("");
    setItems([]);
    setItemActual({ ...ITEM_VACIO });
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "pendiente":  return "bg-yellow-100 text-yellow-800";
      case "aprobada":   return "bg-green-100 text-green-800";
      case "rechazada":  return "bg-red-100 text-red-800";
      case "entregada":  return "bg-blue-100 text-blue-800";
      default:           return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Cargando...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Órdenes de Entrega</h1>
        <div className="flex gap-3">
          <Link
            href="/ordenes-volumen"
            className="bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold py-2 px-4 rounded transition-colors flex items-center gap-2"
          >
            Ir a Volumen (Multi-ítem)
          </Link>
          <button
            onClick={() => setShowForm(true)}
            className="bg-corporate-primary hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Nueva Orden
          </button>
        </div>
      </div>

      {/* ── FORMULARIO MULTI-ÍTEM ──────────────────────────────────────────── */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-6 space-y-6">
          <h2 className="text-xl font-semibold">Nueva Orden de Entrega</h2>

          {/* Campos comunes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Trabajador */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trabajador *
              </label>
              <input
                type="text"
                value={trabajadorInputValue}
                onChange={(e) => {
                  const val = e.target.value;
                  setTrabajadorInputValue(val);
                  const match = trabajadores.find((t) =>
                    `${t.apellidos}, ${t.nombres} - ${t.unidad?.nombre}`
                      .toLowerCase()
                      .includes(val.toLowerCase())
                  );
                  setTrabajadorId(match?.id || 0);
                }}
                list="trabajadores-list"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Buscar trabajador..."
                required
              />
              <datalist id="trabajadores-list">
                {trabajadores.map((t) => (
                  <option
                    key={t.id}
                    value={`${t.apellidos}, ${t.nombres} - ${t.unidad?.nombre}`}
                  />
                ))}
              </datalist>
            </div>

            {/* Motivo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Motivo *
              </label>
              <input
                type="text"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Motivo de la solicitud..."
                required
              />
            </div>

            {/* Observaciones */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observaciones
              </label>
              <textarea
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
                placeholder="Observaciones opcionales..."
              />
            </div>
          </div>

          {/* ── Agregar ítems ──────────────────────────────────────────────── */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h3 className="text-base font-semibold text-gray-800 mb-3">Ítems de la orden</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
              {/* Producto */}
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Producto</label>
                <input
                  type="text"
                  value={itemActual.productoInputValue}
                  onChange={(e) => {
                    const val = e.target.value;
                    const producto = productos.find((p) =>
                      `${p.codigo} - ${p.nombre}`.toLowerCase().includes(val.toLowerCase())
                    );
                    const almacen = producto
                      ? almacenes.find((a) => a.id === producto.almacenId)
                      : undefined;
                    setItemActual({
                      ...itemActual,
                      productoInputValue: val,
                      productoId: producto?.id || 0,
                      productoNombre: producto ? `${producto.codigo} - ${producto.nombre}` : val,
                      almacenId: almacen?.id || 0,
                      almacenNombre: almacen?.nombre || "",
                    });
                  }}
                  list="productos-list"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Buscar producto..."
                />
                <datalist id="productos-list">
                  {productos.map((p) => (
                    <option key={p.id} value={`${p.codigo} - ${p.nombre}`} />
                  ))}
                </datalist>
              </div>

              {/* Cantidad */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Cantidad</label>
                <input
                  type="number"
                  min="1"
                  value={itemActual.cantidad}
                  onChange={(e) =>
                    setItemActual({ ...itemActual, cantidad: parseInt(e.target.value) || 1 })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Almacén auto-detectado */}
            {itemActual.almacenNombre && (
              <p className="text-xs text-gray-500 mb-3">
                Almacén: <span className="font-medium text-gray-700">{itemActual.almacenNombre}</span>
              </p>
            )}

            <button
              type="button"
              onClick={handleAgregarItem}
              className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-2 px-4 rounded-md"
            >
              + Agregar ítem
            </button>

            {/* Tabla de ítems acumulados */}
            {items.length > 0 && (
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-sm divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Almacén</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase"></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {items.map((item, i) => (
                      <tr key={i}>
                        <td className="px-3 py-2">{item.productoNombre}</td>
                        <td className="px-3 py-2">{item.almacenNombre}</td>
                        <td className="px-3 py-2">{item.cantidad}</td>
                        <td className="px-3 py-2">
                          <button
                            type="button"
                            onClick={() => handleEliminarItem(i)}
                            className="text-red-500 hover:text-red-700 text-xs font-medium"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="text-xs text-gray-400 mt-2">
                  {items.length} ítem{items.length !== 1 ? "s" : ""} en la orden
                </p>
              </div>
            )}
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={cancelForm}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting || items.length === 0}
              className="px-4 py-2 bg-corporate-primary text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Creando..." : `Crear Orden${items.length > 1 ? ` (${items.length} ítems)` : ""}`}
            </button>
          </div>
        </form>
      )}

      {/* ── TABLA DE ÓRDENES ───────────────────────────────────────────────── */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trabajador</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {ordenes.map((orden) => (
              <tr key={orden.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {orden.numeroTicket}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(orden.fechaSolicitud).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {orden.trabajador?.apellidos}, {orden.trabajador?.nombres}
                  <br />
                  <span className="text-xs text-gray-500">{orden.trabajador?.unidad?.nombre}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {orden.producto?.codigo} - {orden.producto?.nombre}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {orden.cantidad}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoColor(orden.estado)}`}>
                    {orden.estado}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {orden.estado === "pendiente" && (
                    <>
                      <button
                        onClick={() => handleAprobar(orden.id)}
                        className="text-green-600 hover:text-green-900 mr-3"
                      >
                        Aprobar
                      </button>
                      <button
                        onClick={() => handleRechazar(orden.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Rechazar
                      </button>
                    </>
                  )}
                  {orden.estado === "aprobada" && (
                    <span className="text-green-600">Aprobada</span>
                  )}
                  {orden.estado === "rechazada" && (
                    <span className="text-red-600">Rechazada</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {notificacion && (
        <Notificacion
          mensaje={notificacion.mensaje}
          tipo={notificacion.tipo}
          onClose={() => setNotificacion(null)}
        />
      )}
    </div>
  );
}
