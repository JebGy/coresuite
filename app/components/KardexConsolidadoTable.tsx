"use client";
import React from 'react';
import { KardexConsolidado } from '@/types';
import * as XLSX from 'xlsx';

interface Props {
  data: KardexConsolidado[];
}

export const KardexConsolidadoTable: React.FC<Props> = ({ data }) => {
  const [expandedProductos, setExpandedProductos] = React.useState<Set<number>>(new Set());

  const toggleProducto = (productoId: number) => {
    const newExpanded = new Set(expandedProductos);
    if (newExpanded.has(productoId)) {
      newExpanded.delete(productoId);
    } else {
      newExpanded.add(productoId);
    }
    setExpandedProductos(newExpanded);
  };

  // Función para exportar a Excel
  const exportToExcel = () => {
    // Preparar los datos para exportar (solo la tabla principal)
    const exportData = data.map(producto => ({
      'Producto': producto.productoNombre,
      'Código': producto.productoCodigo,
      'Total Cantidad': producto.totalCantidad,
      'Total Valor': producto.totalValor,
      'Almacenes': producto.almacenes.length
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Kardex Consolidado');
    XLSX.writeFile(wb, 'kardex_consolidado.xlsx');
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="flex justify-end items-center px-4 pt-4 pb-2">
        <button
          onClick={exportToExcel}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded shadow"
        >
          Exportar a Excel
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Producto
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Cantidad
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Valor
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Almacenes
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((producto) => (
              <React.Fragment key={producto.productoId}>
                <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => toggleProducto(producto.productoId)}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <button className="mr-2 text-gray-400 hover:text-gray-600">
                        {expandedProductos.has(producto.productoId) ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        )}
                      </button>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{producto.productoNombre}</div>
                        <div className="text-sm text-gray-500">{producto.productoCodigo}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-semibold">
                    {producto.totalCantidad}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-semibold">
                    S/ {producto.totalValor.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    {producto.almacenes.length} almacén{producto.almacenes.length !== 1 ? 'es' : ''}
                  </td>
                </tr>
                
                {/* Detalle de almacenes */}
                {expandedProductos.has(producto.productoId) && (
                  <tr>
                    <td colSpan={4} className="px-6 py-0">
                      <div className="bg-gray-50 border-t border-gray-200">
                        <div className="px-6 py-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-3">Detalle por Almacén</h4>
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-100">
                                <tr>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Almacén
                                  </th>
                                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Cantidad
                                  </th>
                                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Valor
                                  </th>
                                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Costo Promedio
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {producto.almacenes.map((almacen) => (
                                  <tr key={almacen.almacenId} className="hover:bg-gray-50">
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                      {almacen.almacenNombre}
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">
                                      {almacen.saldoCantidad}
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">
                                      S/ {almacen.saldoValor.toFixed(2)}
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">
                                      S/ {almacen.costoPromedio.toFixed(2)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
            
            {data.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500">
                  No hay datos para mostrar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}; 