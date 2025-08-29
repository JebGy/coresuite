"use client";

import React, { useState, useEffect } from "react";
import { OrdenEntrega, Traslado } from "@/types";
import { getOrdenesEntrega } from "@/app/actions/OrdenesEntregaActions";
import { getTraslados } from "@/app/actions/TrasladosActions";
import { useProductos } from "@/app/hooks/useProductos";

interface BoletaViewProps {
  tipo: "orden-entrega" | "traslado";
  id?: number;
}

interface BoletaData {
  numero: string;
  fecha: string;
  trabajador?: string;
  unidad?: string;
  producto: string;
  cantidad: number;
  precioUnitario: number;
  almacen?: string;
  almacenOrigen?: string;
  almacenDestino?: string;
  estado: string;
  observaciones?: string;
}

const BoletaView: React.FC<BoletaViewProps> = ({ tipo, id }) => {
  const [boletas, setBoletas] = useState<BoletaData[]>([]);
  const [selectedBoleta, setSelectedBoleta] = useState<BoletaData | null>(null);
  const [loading, setLoading] = useState(true);
  const { getProductosPrecios } = useProductos();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Optimización: Usar hook con memoización para obtener productos
        const productosMap = await getProductosPrecios();

        if (tipo === "orden-entrega") {
          const ordenes = await getOrdenesEntrega();

          // Mapear órdenes usando el mapa de precios precargado
          const boletasData = ordenes.map((orden: OrdenEntrega) => {
            const precioUnitario = productosMap.get(orden.productoId) || 0;

            return {
              numero: orden.numeroTicket,
              fecha: new Date(orden.fechaSolicitud).toLocaleDateString("es-PE"),
              trabajador: orden.trabajador
                ? `${orden.trabajador.nombres} ${orden.trabajador.apellidos}`
                : "N/A",
              unidad: orden.trabajador?.unidad?.nombre || "N/A",
              producto: orden.producto?.nombre || "N/A",
              cantidad: orden.cantidad,
              precioUnitario,
              almacen: orden.almacen?.nombre || "N/A",
              estado: orden.estado,
              observaciones: orden.observaciones,
            };
          });

          setBoletas(boletasData);
          if (id) {
            const selectedOrden = boletasData.find(
              (_, index) => ordenes[index].id === id
            );
            setSelectedBoleta(selectedOrden || null);
          }
        } else {
          const response = await getTraslados();
          if (response.success && response.data) {
            // Mapear traslados usando el mapa de precios precargado
            const boletasData = response.data.map((traslado: Traslado) => {
              const precioUnitario =
                productosMap.get(traslado.producto.id) || 0;

              return {
                numero: traslado.numeroGuia,
                fecha: new Date().toLocaleDateString("es-PE"), // Traslado no tiene fecha específica en el tipo
                trabajador: "N/A", // Necesitaríamos obtener datos del trabajador
                unidad: "N/A",
                producto: traslado.producto.nombre,
                cantidad: traslado.cantidad,
                precioUnitario,
                almacenOrigen: traslado.almacenOrigen.nombre,
                almacenDestino: traslado.almacenDestino.nombre,
                estado: traslado.estado,
                observaciones: traslado.observaciones,
              };
            });

            setBoletas(boletasData);
            if (id) {
              const selectedTraslado = boletasData.find(
                (_, index) => response.data![index].id === id
              );
              setSelectedBoleta(selectedTraslado || null);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  // Función para agrupar boletas por fecha
  const groupBoletasByDate = (boletas: BoletaData[]) => {
    const grouped = boletas.reduce((acc, boleta) => {
      const fecha = boleta.fecha;
      if (!acc[fecha]) {
        acc[fecha] = [];
      }
      acc[fecha].push(boleta);
      return acc;
    }, {} as Record<string, BoletaData[]>);

    // Ordenar las fechas de más reciente a más antigua
    const sortedDates = Object.keys(grouped).sort((a, b) => {
      const dateA = new Date(a.split("/").reverse().join("-"));
      const dateB = new Date(b.split("/").reverse().join("-"));
      return dateB.getTime() - dateA.getTime();
    });

    return sortedDates.map((fecha) => ({
      fecha,
      boletas: grouped[fecha],
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex gap-6 h-screen">
      {/* Lista de boletas - Columna Derecha */}
      <div className="w-96 bg-white rounded-lg shadow-md p-6 overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">
          {tipo === "orden-entrega" ? "Órdenes de Entrega" : "Traslados"}
        </h2>
        <div className="space-y-6">
          {groupBoletasByDate(boletas).map((group, groupIndex) => (
            <div
              key={groupIndex}
              className="border-b border-gray-200 pb-4 last:border-b-0"
            >
              <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold mr-2">
                  {group.boletas.length}
                </span>
                {group.fecha}
              </h3>
              <div className="space-y-2">
                {group.boletas.map((boleta, index) => (
                  <div
                    key={index}
                    className={`border border-gray-200 rounded-lg p-3 cursor-pointer transition-colors hover:shadow-md ${
                      selectedBoleta?.numero === boleta.numero
                        ? "bg-blue-50 border-blue-300 shadow-md"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => setSelectedBoleta(boleta)}
                  >
                    <div className="font-semibold text-blue-600 text-sm">
                      {boleta.numero}
                    </div>
                    <div className="text-xs text-gray-600">{boleta.fecha}</div>
                    <div className="text-xs truncate">{boleta.producto}</div>
                    <div className="text-xs text-gray-500">
                      Cant: {boleta.cantidad}
                    </div>
                    {boleta.trabajador !== "N/A" && (
                      <div className="text-xs text-gray-400 truncate">
                        {boleta.trabajador}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Vista de boleta - Columna Izquierda */}
      <div className="flex-1">
        {selectedBoleta ? (
          <div className="bg-white h-full">
            {/* Botones de acción - solo visible en pantalla */}
            <div className="print:hidden mb-4 flex justify-end space-x-2">
              <button
                onClick={handlePrint}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Imprimir
              </button>
              <button
                onClick={() => setSelectedBoleta(null)}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Limpiar
              </button>
            </div>

            {/* Boleta imprimible */}
            <div className="boleta-container bg-white border border-gray-300 max-w-4xl mx-auto overflow-y-auto">
              {/* Header */}
              <div className="border-b border-gray-300 p-6">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-4">
                    <div className="w-48 rounded">
                      <span className="text-sm font-semibold">
                        <img src="/rg.png" alt="logo Ramirez Group" className=""/>
                      </span>
                    </div>
                    <div className="text-xs">
                      <div>RUC: 20603543565</div>
                      <div>
                        DIRECCIÓN: AV. LAS AMERICAS NRO. 1714
                      </div>
                    </div>
                  </div>
                  <div className="border border-gray-400 p-3 text-center">
                    <div className="text-xs font-semibold">
                      R.U.C. N° 20603543565
                    </div>
                    <div className="text-sm font-bold mt-1">
                      {tipo === "orden-entrega"
                        ? "BOLETA DE ENTREGA"
                        : "GUÍA DE TRASLADO"}
                    </div>
                    <div className="text-lg font-bold">
                      {selectedBoleta.numero}
                    </div>
                  </div>
                </div>
              </div>

              {/* Información del documento */}
              <div className="p-6">
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <div className="text-sm mb-2">
                      <span className="font-semibold">FECHA:</span>{" "}
                      {selectedBoleta.fecha}
                    </div>
                    <div className="text-sm mb-2">
                      <span className="font-semibold">TRABAJADOR:</span>{" "}
                      {selectedBoleta.trabajador}
                    </div>
                    <div className="text-sm mb-2">
                      <span className="font-semibold">UNIDAD:</span>{" "}
                      {selectedBoleta.unidad}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm mb-2">
                      <span className="font-semibold">ESTADO:</span>
                      <span
                        className={`ml-2 px-2 py-1 rounded text-xs ${
                          selectedBoleta.estado === "aprobada" ||
                          selectedBoleta.estado === "APROBADO" ||
                          selectedBoleta.estado === "COMPLETADO"
                            ? "bg-green-100 text-green-800"
                            : selectedBoleta.estado === "pendiente" ||
                              selectedBoleta.estado === "PENDIENTE"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {selectedBoleta.estado.toUpperCase()}
                      </span>
                    </div>
                    {tipo === "traslado" && (
                      <>
                        <div className="text-sm mb-2">
                          <span className="font-semibold">ORIGEN:</span>{" "}
                          {selectedBoleta.almacenOrigen}
                        </div>
                        <div className="text-sm mb-2">
                          <span className="font-semibold">DESTINO:</span>{" "}
                          {selectedBoleta.almacenDestino}
                        </div>
                      </>
                    )}
                    {tipo === "orden-entrega" && (
                      <div className="text-sm mb-2">
                        <span className="font-semibold">ALMACÉN:</span>{" "}
                        {selectedBoleta.almacen}
                      </div>
                    )}
                  </div>
                </div>

                {/* Tabla de productos */}
                <table className="w-full border-collapse border border-gray-300 mb-6">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 p-2 text-left text-sm font-semibold">
                        CANT.
                      </th>
                      <th className="border border-gray-300 p-2 text-left text-sm font-semibold">
                        DESCRIPCIÓN
                      </th>

                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 p-2 text-sm">
                        {selectedBoleta.cantidad}
                      </td>
                      <td className="border border-gray-300 p-2 text-sm">
                        {selectedBoleta.producto}
                      </td>

                    </tr>
                    {/* Filas vacías para completar el formato */}
                    {[...Array(2)].map((_, i) => (
                      <tr key={i}>
                        <td className="border border-gray-300 p-2 text-sm h-8">
                          &nbsp;
                        </td>
                        <td className="border border-gray-300 p-2 text-sm">
                          &nbsp;
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Observaciones */}
                {selectedBoleta.observaciones && (
                  <div className="mb-6">
                    <div className="text-sm font-semibold mb-2">
                      OBSERVACIONES:
                    </div>
                    <div className="text-sm border border-gray-300 p-3 min-h-[60px]">
                      {selectedBoleta.observaciones}
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="flex justify-between items-end mt-16">
                  <div className="text-center">
                    <div className="border-t border-gray-400 w-48 mb-2"></div>
                    <div className="text-xs">FIRMA DEL SOLICITANTE</div>
                  </div>
                  <div className="text-center">
                    <div className="border-t border-gray-400 w-48 mb-2"></div>
                    <div className="text-xs">FIRMA DEL RESPONSABLE</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg">
            <div className="text-center text-gray-500">
              <div className="text-lg font-medium mb-2">
                Selecciona una{" "}
                {tipo === "orden-entrega"
                  ? "orden de entrega"
                  : "guía de traslado"}
              </div>
              <div className="text-sm">
                Elige un documento de la lista para ver su formato de boleta
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BoletaView;
