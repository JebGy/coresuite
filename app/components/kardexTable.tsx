"use client";
import React from 'react';
import { KardexRow } from '@/types';

interface Props {
  data: KardexRow[];
}

export const KardexTable: React.FC<Props> = ({ data }) => (
  <div className="bg-white rounded-lg shadow-lg overflow-hidden">
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Detalle</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Almacén</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Entradas</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Salidas</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Factura</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Saldo (Unidades)</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Saldo (Valor)</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Costo Promedio</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, i) => (
            <tr key={i} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.fecha}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.detalle}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {row.almacenNombre || 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{row.entrada}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{row.salida}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {row.factura! || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                {row.saldoCantidad}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                S/ {row.saldoValor.toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                S/ {row.costoPromedio.toFixed(2)}
              </td>
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan={9} className="px-6 py-8 text-center text-sm text-gray-500">
                No hay datos para mostrar.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);