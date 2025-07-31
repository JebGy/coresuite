"use client";

import { useState, useEffect } from "react";
import { getAlmacenes } from "../actions/AlmacenesActions";
import { getProductos } from "../actions/ProductosActions";
import {
  createTraslado,
  getTraslados,
  updateTrasladoStatus,
} from "../actions/TrasladosActions";
import { Notificacion } from "../components/Notificacion";
import { Almacen, Producto, Traslado } from "@/types";

export default function TrasladosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [almacenes, setAlmacenes] = useState<Almacen[]>([]);
  const [traslados, setTraslados] = useState<Traslado[]>([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedOrigin, setSelectedOrigin] = useState("");
  const [selectedDestination, setSelectedDestination] = useState("");
  const [quantity, setQuantity] = useState("");
  const [observations, setObservations] = useState("");
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });
  const [productoInput, setProductoInput] = useState("");
  const[mostrarSugerencias,setMostrarSugerencias] = useState(false)
  const [sugerenciasProducto, setSugerenciasProducto] = useState<Producto[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (productoInput.trim() === "") {
      setSugerenciasProducto([]);
      return;
    }
    const sugerencias = productos.filter(
      (p) =>
        p.nombre.toLowerCase().includes(productoInput.toLowerCase()) ||
        p.codigo?.toLowerCase().includes(productoInput.toLowerCase())
    );
    setSugerenciasProducto(sugerencias);
  }, [productoInput, productos]);


  const loadData = async () => {
    try {
      const [productosRes, almacenesRes, trasladosRes] = await Promise.all([
        getProductos(),
        getAlmacenes(),
        getTraslados(),
      ]);

      console.log("Productos cargados:", productosRes);

      if (productosRes.success && productosRes.data) {
        setProductos(productosRes.data);
        setSugerenciasProducto(productosRes.data)
      }
      if (almacenesRes.success && almacenesRes.data) {
        setAlmacenes(almacenesRes.data);
      }
      if (trasladosRes.success && trasladosRes.data) {
        setTraslados(trasladosRes.data);
      }
    } catch (error) {
      console.error("Error al cargar datos:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (
      !selectedProduct ||
      !selectedOrigin ||
      !selectedDestination ||
      !quantity
    ) {
      setNotification({
        show: true,
        message: "Por favor complete todos los campos requeridos",
        type: "error",
      });
      return;
    }

    if (selectedOrigin === selectedDestination) {
      setNotification({
        show: true,
        message: "El almacén de origen y destino no pueden ser el mismo",
        type: "error",
      });
      return;
    }

    const result = await createTraslado({
      productoId: parseInt(selectedProduct),
      almacenOrigenId: parseInt(selectedOrigin),
      almacenDestinoId: parseInt(selectedDestination),
      cantidad: parseInt(quantity),
      observaciones: observations,
      trabajadorId: 1, // TODO: Get from session
    });

    if (result.success) {
      setNotification({
        show: true,
        message: "Traslado creado exitosamente",
        type: "success",
      });
      loadData();
      // Reset form
      setSelectedProduct("");
      setSelectedOrigin("");
      setSelectedDestination("");
      setQuantity("");
      setObservations("");
    } else {
      setNotification({
        show: true,
        message: result.error || "Error al crear el traslado",
        type: "error",
      });
    }
  };

  const handleStatusUpdate = async (
    id: number,
    newStatus: Traslado["estado"]
  ) => {
    const result = await updateTrasladoStatus(id, newStatus);
    if (result.success) {
      setNotification({
        show: true,
        message: "Estado actualizado exitosamente",
        type: "success",
      });
      loadData();
    } else {
      setNotification({
        show: true,
        message: result.error || "Error al actualizar el estado",
        type: "error",
      });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Gestión de Traslados</h1>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Nuevo Traslado</h2>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Producto
            </label>
            <div className="relative">
              <input
                type="text"
                name="productoInput"
                autoComplete="off"
                value={productoInput}
                onChange={(e) => {
                  setProductoInput(e.target.value);
                  setMostrarSugerencias(true);
                }}
                onFocus={() => setMostrarSugerencias(true)}
                onBlur={() =>
                  setTimeout(() => setMostrarSugerencias(false), 150)
                }
                placeholder="Escribe el nombre o código del producto"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 bg-white"
                required
              />
              {/* Sugerencias */}
              {mostrarSugerencias && sugerenciasProducto.length > 0 && (
                <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg mt-1 max-h-48 overflow-y-auto shadow-lg">
                  {sugerenciasProducto.map((p) => (
                    <li
                      key={p.id}
                      className="px-4 py-2 cursor-pointer flex flex-col hover:bg-blue-100 text-gray-800"
                      onMouseDown={() => {
                        setProductoInput(`${p.nombre} (${p.codigo})`);
                        // Aquí deberías actualizar el estado relacionado con el producto seleccionado para traslados, por ejemplo:
                        // 
                        setSelectedProduct(p.id.toString())
                        setSelectedOrigin(p.almacenId?.toString()!)
                        
                        setMostrarSugerencias(false);
                      }}
                    >
                      <p className="font-bold">
                        {p.nombre}{" "}
                        <span className="text-xs font-normal text-gray-500">
                          ({p.codigo})
                        </span>
                      </p>
                      <span className="text-gray-500">{p.descripcion}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Almacén Origen
            </label>
            <input
              type="text"
              value={
                almacenes.find((a) => a.id === parseInt(selectedOrigin))
                  ?.nombre || ""
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 bg-white"
              disabled
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Almacén Destino
            </label>
            <select
              value={selectedDestination}
              onChange={(e) => setSelectedDestination(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 bg-white"
            >
              <option value="">Seleccione almacén destino</option>
              {almacenes
                .filter((almacen) => almacen.id !== parseInt(selectedOrigin))
                .map((almacen) => (
                  <option key={almacen.id} value={almacen.id}>
                    {almacen.nombre}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Cantidad
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 bg-white"
              min="1"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Observaciones
            </label>
            <textarea
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 bg-white"
              rows={3}
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Crear Traslado
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Lista de Traslados</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Guía
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Origen
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Destino
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
              {traslados.map((traslado) => (
                <tr key={traslado.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {traslado.numeroGuia}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {traslado.producto.nombre}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {traslado.almacenOrigen.nombre}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {traslado.almacenDestino.nombre}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {traslado.cantidad}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        traslado.estado === "COMPLETADO"
                          ? "bg-green-100 text-green-800"
                          : traslado.estado === "PENDIENTE"
                          ? "bg-yellow-100 text-yellow-800"
                          : traslado.estado === "RECHAZADO"
                          ? "bg-red-100 text-red-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {traslado.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {traslado.estado === "PENDIENTE" && (
                      <div className="space-x-2">
                        <button
                          onClick={() =>
                            handleStatusUpdate(traslado.id, "APROBADO")
                          }
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Aprobar
                        </button>
                        <button
                          onClick={() =>
                            handleStatusUpdate(traslado.id, "RECHAZADO")
                          }
                          className="text-red-600 hover:text-red-900"
                        >
                          Rechazar
                        </button>
                      </div>
                    )}
                    {traslado.estado === "APROBADO" && (
                      <button
                        onClick={() =>
                          handleStatusUpdate(traslado.id, "COMPLETADO")
                        }
                        className="text-green-600 hover:text-green-900"
                      >
                        Completar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {notification.show && (
        <Notificacion
          mensaje={notification.message}
          tipo={
            notification.type === "success"
              ? "exito"
              : notification.type === "error"
              ? "error"
              : "info"
          }
          onClose={() => setNotification({ ...notification, show: false })}
        />
      )}
    </div>
  );
}
