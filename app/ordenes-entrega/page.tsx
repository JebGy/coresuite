"use client";

import { useState, useEffect } from "react";
import { OrdenEntrega, Trabajador, Producto, Almacen } from "@/types";
import {
  getOrdenesEntrega,
  createOrdenEntrega,
  aprobarOrdenEntrega,
  rechazarOrdenEntrega,
} from "@/app/actions/OrdenesEntregaActions";
import { getTrabajadores } from "@/app/actions/TrabajadoresActions";
import { getProductos } from "@/app/actions/ProductosActions";
import { getAlmacenes } from "@/app/actions/AlmacenesActions";
import { useUser } from "@/app/context/UserContext";
import { Notificacion } from "../components/Notificacion";

export default function OrdenesEntregaPage() {
  const [ordenes, setOrdenes] = useState<OrdenEntrega[]>([]);
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [almacenes, setAlmacenes] = useState<Almacen[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    trabajadorId: 0,
    productoId: 0,
    almacenId: 0,
    cantidad: 1,
    motivo: "",
    observaciones: "",
    trabajadorNombre: "", // Agregar para el input autocompletable
    productoNombre: "", // Agregar para el input autocompletable
  });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.trabajadorId || !formData.productoId || !formData.almacenId) {
      setNotificacion({
        mensaje: "Debe completar todos los campos obligatorios",
        tipo: "error",
      });
      return;
    }

    if (formData.cantidad <= 0) {
      setNotificacion({
        mensaje: "La cantidad debe ser mayor a 0",
        tipo: "error",
      });
      return;
    }

    try {
      await createOrdenEntrega(formData, user.id);
      setNotificacion({
        mensaje: "Orden de entrega creada correctamente",
        tipo: "exito",
      });
      setShowForm(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error("Error al crear orden de entrega:", error);
      setNotificacion({
        mensaje: "Error al crear la orden de entrega",
        tipo: "error",
      });
    }
  };

  const handleAprobar = async (id: number) => {
    if (!confirm("¿Está seguro de que desea aprobar esta orden de entrega?"))
      return;

    try {
      await aprobarOrdenEntrega(id, user.id);
      setNotificacion({
        mensaje: "Orden de entrega aprobada correctamente",
        tipo: "exito",
      });
      loadData();
    } catch (error) {
      console.error("Error al aprobar orden:", error);
      setNotificacion({
        mensaje:
          error instanceof Error ? error.message : "Error al aprobar la orden",
        tipo: "error",
      });
    }
  };

  const handleRechazar = async (id: number) => {
    const motivo = prompt("Ingrese el motivo del rechazo:");
    if (!motivo) return;

    try {
      await rechazarOrdenEntrega(id, motivo, user.id);
      setNotificacion({
        mensaje: "Orden de entrega rechazada correctamente",
        tipo: "exito",
      });
      loadData();
    } catch (error) {
      console.error("Error al rechazar orden:", error);
      setNotificacion({ mensaje: "Error al rechazar la orden", tipo: "error" });
    }
  };

  const resetForm = () => {
    setFormData({
      trabajadorId: 0,
      productoId: 0,
      almacenId: 0,
      cantidad: 1,
      motivo: "",
      observaciones: "",
      trabajadorNombre: "", // Resetear también los campos de nombre
      productoNombre: "",
    });
  };

  const cancelForm = () => {
    setShowForm(false);
    resetForm();
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "pendiente":
        return "bg-yellow-100 text-yellow-800";
      case "aprobada":
        return "bg-green-100 text-green-800";
      case "rechazada":
        return "bg-red-100 text-red-800";
      case "entregada":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">Cargando...</div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Órdenes de Entrega</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Nueva Orden
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Nueva Orden de Entrega</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trabajador *
                </label>
                <input
                  type="text"
                  value={formData.trabajadorNombre}
                  onChange={(e) => {
                    const trabajadorNombre = e.target.value;
                    const trabajador = trabajadores.find((t) => 
                      `${t.apellidos}, ${t.nombres} - ${t.unidad?.nombre}`.toLowerCase().includes(trabajadorNombre.toLowerCase())
                    );
                    setFormData({
                      ...formData,
                      trabajadorId: trabajador?.id || 0,
                      trabajadorNombre,
                    });
                  }}
                  list="trabajadores"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Buscar trabajador..."
                  required
                />
                <datalist id="trabajadores">
                  {trabajadores.map((trabajador) => (
                    <option key={trabajador.id} value={`${trabajador.apellidos}, ${trabajador.nombres} - ${trabajador.unidad?.nombre}`}>
                      {trabajador.apellidos}, {trabajador.nombres} - {trabajador.unidad?.nombre}
                    </option>
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Producto *
                </label>
                <input
                  type="text"
                  value={formData.productoNombre}
                  onChange={(e) => {
                    const productoNombre = e.target.value;
                    const producto = productos.find((p) => 
                      `${p.codigo} - ${p.nombre}`.toLowerCase().includes(productoNombre.toLowerCase())
                    );
                    setFormData({
                      ...formData,
                      productoId: producto?.id || 0,
                      productoNombre,
                      almacenId: producto?.almacenId || 0,
                    });
                  }}
                  list="productos"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Buscar producto..."
                  required
                />
                <datalist id="productos">
                  {productos.map((producto) => (
                    <option key={producto.id} value={`${producto.codigo} - ${producto.nombre}`}>
                      {producto.codigo} - {producto.nombre}
                    </option>
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Almacén *
                </label>
                <input
                  type="text"
                  value={(() => {
                    const prod = productos.find(
                      (p) => p.id === formData.productoId
                    );
                    const almacen = almacenes.find(
                      (a) => a.id === (prod?.almacenId || 0)
                    );
                    return almacen ? almacen.nombre : "";
                  })()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-900"
                  readOnly
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cantidad *
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.cantidad}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      cantidad: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Motivo *
              </label>
              <input
                type="text"
                value={formData.motivo}
                onChange={(e) =>
                  setFormData({ ...formData, motivo: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observaciones
              </label>
              <textarea
                value={formData.observaciones}
                onChange={(e) =>
                  setFormData({ ...formData, observaciones: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>

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
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Crear Orden
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ticket
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trabajador
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Producto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cantidad
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
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
                  <span className="text-xs text-gray-500">
                    {orden.trabajador?.unidad?.nombre}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {orden.producto?.codigo} - {orden.producto?.nombre}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {orden.cantidad}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoColor(
                      orden.estado
                    )}`}
                  >
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
