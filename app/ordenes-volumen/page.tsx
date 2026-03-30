"use client";

import { useState, useEffect, useCallback } from "react";
import {
  OrdenVolumen,
  ItemOrdenVolumenForm,
  Trabajador,
  Producto,
  Almacen,
} from "@/types";
import {
  getOrdenesVolumen,
  createOrdenVolumen,
  aprobarOrdenVolumen,
  rechazarOrdenVolumen,
} from "@/app/actions/OrdenesVolumenActions";
import { getTrabajadores } from "@/app/actions/TrabajadoresActions";
import { getProductos } from "@/app/actions/ProductosActions";
import { getAlmacenes } from "@/app/actions/AlmacenesActions";
import { useUser } from "@/app/context/UserContext";
import { Notificacion } from "../components/Notificacion";

const PAGE_SIZE_OPTIONS = [10, 20, 50];
const ITEM_VACIO: ItemOrdenVolumenForm = {
  productoId: 0,
  productoNombre: "",
  almacenId: 0,
  almacenNombre: "",
  cantidad: 1,
};

const ESTADO_COLORS: Record<string, string> = {
  pendiente: "bg-yellow-100 text-yellow-800",
  aprobada: "bg-green-100 text-green-800",
  rechazada: "bg-red-100 text-red-800",
};

export default function OrdenesVolumenPage() {
  // ── Datos maestros
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [almacenes, setAlmacenes] = useState<Almacen[]>([]);

  // ── Tabla paginada
  const [ordenes, setOrdenes] = useState<OrdenVolumen[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // ── Filas expandidas
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  // ── Formulario
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [trabajadorId, setTrabajadorId] = useState(0);
  const [trabajadorInput, setTrabajadorInput] = useState("");
  const [motivo, setMotivo] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [items, setItems] = useState<ItemOrdenVolumenForm[]>([]);
  const [itemActual, setItemActual] = useState<ItemOrdenVolumenForm & { productoInput: string }>({
    ...ITEM_VACIO,
    productoInput: "",
  });

  const [notificacion, setNotificacion] = useState<{
    mensaje: string;
    tipo?: "exito" | "error" | "info";
  } | null>(null);

  const user = useUser();

  // ── Cargar maestros ──────────────────────────────────────────────────────
  useEffect(() => {
    Promise.all([getTrabajadores(), getProductos(), getAlmacenes()]).then(
      ([t, p, a]) => {
        setTrabajadores(t);
        if (p.success && p.data) setProductos(p.data);
        if (a.success && a.data) setAlmacenes(a.data);
      }
    );
  }, []);

  // ── Cargar órdenes paginadas ─────────────────────────────────────────────
  const loadOrdenes = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getOrdenesVolumen(page, pageSize);
      setOrdenes(result.ordenes);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch {
      setNotificacion({ mensaje: "Error al cargar las órdenes", tipo: "error" });
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    loadOrdenes();
  }, [loadOrdenes]);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const toggleExpand = (id: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const resetForm = () => {
    setShowForm(false);
    setTrabajadorId(0);
    setTrabajadorInput("");
    setMotivo("");
    setObservaciones("");
    setItems([]);
    setItemActual({ ...ITEM_VACIO, productoInput: "" });
  };

  // ── Agregar ítem ─────────────────────────────────────────────────────────
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
    setItemActual({ ...ITEM_VACIO, productoInput: "" });
  };

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trabajadorId) {
      setNotificacion({ mensaje: "Seleccione un trabajador", tipo: "error" });
      return;
    }
    if (!motivo.trim()) {
      setNotificacion({ mensaje: "El motivo es obligatorio", tipo: "error" });
      return;
    }
    if (items.length === 0) {
      setNotificacion({ mensaje: "Agregue al menos un ítem", tipo: "error" });
      return;
    }
    setSubmitting(true);
    try {
      await createOrdenVolumen(
        {
          trabajadorId,
          motivo,
          observaciones: observaciones || undefined,
          items: items.map((i) => ({
            productoId: i.productoId,
            almacenId: i.almacenId,
            cantidad: i.cantidad,
          })),
        },
        user.id
      );
      setNotificacion({
        mensaje: `Orden creada con ${items.length} ítem(s)`,
        tipo: "exito",
      });
      resetForm();
      loadOrdenes();
    } catch (err) {
      setNotificacion({
        mensaje: err instanceof Error ? err.message : "Error al crear la orden",
        tipo: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAprobar = async (id: number) => {
    if (!confirm("¿Aprobar esta orden de volumen?")) return;
    try {
      const result = await aprobarOrdenVolumen(id, user.id);
      if (!result.success) {
        setNotificacion({ mensaje: result.error, tipo: "error" });
        return;
      }
      setNotificacion({ mensaje: "Orden aprobada correctamente", tipo: "exito" });
      loadOrdenes();
    } catch (err) {
      setNotificacion({
        mensaje: err instanceof Error ? err.message : "Error al aprobar",
        tipo: "error",
      });
    }
  };

  const handleRechazar = async (id: number) => {
    const motivoRechazo = prompt("Motivo del rechazo:");
    if (!motivoRechazo) return;
    try {
      const result = await rechazarOrdenVolumen(id, motivoRechazo, user.id);
      if (!result.success) {
        setNotificacion({ mensaje: result.error, tipo: "error" });
        return;
      }
      setNotificacion({ mensaje: "Orden rechazada", tipo: "exito" });
      loadOrdenes();
    } catch {
      setNotificacion({ mensaje: "Error al rechazar la orden", tipo: "error" });
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Cabecera */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Órdenes por Volumen</h1>
          <p className="text-sm text-gray-500 mt-1">
            {total} orden{total !== 1 ? "es" : ""} en total
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-corporate-primary hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          + Nueva Orden
        </button>
      </div>

      {/* ── Formulario ─────────────────────────────────────────────────────── */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-lg shadow-md space-y-5"
        >
          <h2 className="text-xl font-semibold border-b pb-2">Nueva Orden por Volumen</h2>

          {/* Campos comunes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trabajador *
              </label>
              <input
                type="text"
                value={trabajadorInput}
                onChange={(e) => {
                  const val = e.target.value;
                  setTrabajadorInput(val);
                  const match = trabajadores.find((t) =>
                    `${t.apellidos}, ${t.nombres} - ${t.unidad?.nombre}`
                      .toLowerCase()
                      .includes(val.toLowerCase())
                  );
                  setTrabajadorId(match?.id || 0);
                }}
                list="vol-trabajadores"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Buscar trabajador..."
              />
              <datalist id="vol-trabajadores">
                {trabajadores.map((t) => (
                  <option
                    key={t.id}
                    value={`${t.apellidos}, ${t.nombres} - ${t.unidad?.nombre}`}
                  />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Motivo *
              </label>
              <input
                type="text"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Motivo de la solicitud..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observaciones
              </label>
              <textarea
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Agregar ítems */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-3">
            <h3 className="font-semibold text-gray-800">Ítems</h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Producto
                </label>
                <input
                  type="text"
                  value={itemActual.productoInput}
                  onChange={(e) => {
                    const val = e.target.value;
                    const producto = productos.find((p) =>
                      `${p.codigo} - ${p.nombre}`
                        .toLowerCase()
                        .includes(val.toLowerCase())
                    );
                    const almacen = producto
                      ? almacenes.find((a) => a.id === producto.almacenId)
                      : undefined;
                    setItemActual({
                      ...itemActual,
                      productoInput: val,
                      productoId: producto?.id || 0,
                      productoNombre: producto
                        ? `${producto.codigo} - ${producto.nombre}`
                        : val,
                      almacenId: almacen?.id || 0,
                      almacenNombre: almacen?.nombre || "",
                    });
                  }}
                  list="vol-productos"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Buscar producto..."
                />
                <datalist id="vol-productos">
                  {productos.map((p) => (
                    <option key={p.id} value={`${p.codigo} - ${p.nombre}`} />
                  ))}
                </datalist>
                {itemActual.almacenNombre && (
                  <p className="text-xs text-gray-400 mt-1">
                    Almacén:{" "}
                    <span className="font-medium text-gray-600">
                      {itemActual.almacenNombre}
                    </span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Cantidad
                </label>
                <input
                  type="number"
                  min="1"
                  value={itemActual.cantidad}
                  onChange={(e) =>
                    setItemActual({
                      ...itemActual,
                      cantidad: parseInt(e.target.value) || 1,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={handleAgregarItem}
                className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-2 px-4 rounded-md h-[38px]"
              >
                + Agregar
              </button>
            </div>

            {/* Tabla de ítems acumulados */}
            {items.length > 0 && (
              <div className="overflow-x-auto mt-2">
                <table className="min-w-full text-sm divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        #
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Producto
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Almacén
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Cant.
                      </th>
                      <th className="px-3 py-2" />
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {items.map((item, i) => (
                      <tr key={i}>
                        <td className="px-3 py-2 text-gray-400">{i + 1}</td>
                        <td className="px-3 py-2">{item.productoNombre}</td>
                        <td className="px-3 py-2">{item.almacenNombre}</td>
                        <td className="px-3 py-2 font-medium">{item.cantidad}</td>
                        <td className="px-3 py-2 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              setItems((prev) => prev.filter((_, j) => j !== i))
                            }
                            className="text-red-500 hover:text-red-700 text-xs"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="text-xs text-gray-400 mt-1">
                  {items.length} ítem{items.length !== 1 ? "s" : ""} en la orden
                </p>
              </div>
            )}
          </div>

          {/* Acciones */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting || items.length === 0}
              className="px-4 py-2 bg-corporate-primary text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting
                ? "Guardando..."
                : `Crear Orden${items.length > 0 ? ` (${items.length} ítem${items.length !== 1 ? "s" : ""})` : ""}`}
            </button>
          </div>
        </form>
      )}

      {/* ── Tabla de órdenes ────────────────────────────────────────────────── */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-40 text-gray-500">
            Cargando...
          </div>
        ) : ordenes.length === 0 ? (
          <div className="flex justify-center items-center h-40 text-gray-400">
            No hay órdenes registradas
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-8 px-3 py-3" />
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ticket
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trabajador
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Motivo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ítems
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {ordenes.map((orden) => (
                  <>
                    {/* Fila principal */}
                    <tr
                      key={orden.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => toggleExpand(orden.id)}
                    >
                      <td className="px-3 py-4 text-center text-gray-400">
                        <span className="text-xs select-none">
                          {expanded.has(orden.id) ? "▲" : "▼"}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-mono font-medium text-gray-900">
                        {orden.numeroTicket}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                        {new Date(orden.fechaSolicitud).toLocaleDateString("es-PE")}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {orden.trabajador?.apellidos}, {orden.trabajador?.nombres}
                        <br />
                        <span className="text-xs text-gray-400">
                          {orden.trabajador?.unidad?.nombre}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700 max-w-[200px] truncate">
                        {orden.motivo}
                      </td>
                      <td className="px-4 py-4 text-sm text-center">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-xs">
                          {orden.items.length}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            ESTADO_COLORS[orden.estado] ?? "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {orden.estado}
                        </span>
                      </td>
                      <td
                        className="px-4 py-4 whitespace-nowrap text-sm font-medium"
                        onClick={(e) => e.stopPropagation()}
                      >
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

                    {/* Fila de ítems expandida */}
                    {expanded.has(orden.id) && (
                      <tr key={`${orden.id}-items`} className="bg-blue-50">
                        <td colSpan={8} className="px-8 py-3">
                          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                            Detalle de ítems — {orden.numeroTicket}
                          </p>
                          <table className="min-w-full text-sm">
                            <thead>
                              <tr className="text-xs text-gray-500 border-b border-blue-100">
                                <th className="text-left py-1 pr-4">#</th>
                                <th className="text-left py-1 pr-4">Código</th>
                                <th className="text-left py-1 pr-4">Producto</th>
                                <th className="text-left py-1 pr-4">Almacén</th>
                                <th className="text-left py-1">Cantidad</th>
                              </tr>
                            </thead>
                            <tbody>
                              {orden.items.map((item, i) => (
                                <tr key={item.id} className="border-b border-blue-50">
                                  <td className="py-1 pr-4 text-gray-400">{i + 1}</td>
                                  <td className="py-1 pr-4 font-mono text-xs text-gray-600">
                                    {item.producto?.codigo}
                                  </td>
                                  <td className="py-1 pr-4 text-gray-800">
                                    {item.producto?.nombre}
                                  </td>
                                  <td className="py-1 pr-4 text-gray-600">
                                    {item.almacen?.nombre}
                                  </td>
                                  <td className="py-1 font-semibold text-gray-900">
                                    {item.cantidad}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Paginación ──────────────────────────────────────────────────── */}
        {!loading && total > 0 && (
          <div className="px-4 py-3 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Filas por página:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
              >
                {PAGE_SIZE_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <span className="text-gray-400">
                {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} de {total}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(1)}
                disabled={page === 1}
                className="px-2 py-1 rounded border border-gray-300 text-sm disabled:opacity-40 hover:bg-gray-50"
              >
                «
              </button>
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 1}
                className="px-3 py-1 rounded border border-gray-300 text-sm disabled:opacity-40 hover:bg-gray-50"
              >
                ‹ Anterior
              </button>

              {/* páginas visibles */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
                )
                .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                  if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1)
                    acc.push("…");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === "…" ? (
                    <span key={`ellipsis-${i}`} className="px-2 py-1 text-gray-400 text-sm">
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p as number)}
                      className={`px-3 py-1 rounded border text-sm ${
                        page === p
                          ? "bg-corporate-primary text-white border-corporate-primary"
                          : "border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}

              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page === totalPages}
                className="px-3 py-1 rounded border border-gray-300 text-sm disabled:opacity-40 hover:bg-gray-50"
              >
                Siguiente ›
              </button>
              <button
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages}
                className="px-2 py-1 rounded border border-gray-300 text-sm disabled:opacity-40 hover:bg-gray-50"
              >
                »
              </button>
            </div>
          </div>
        )}
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
