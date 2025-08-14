import React from "react";
import { KardexTable } from "./kardexTable";
import { Producto } from "@/types";
import { EmptyState } from "./EmptyState";

interface ProductKardexViewProps {
  productos: Producto[];
  productoSeleccionado: number | null;
  setProductoSeleccionado: (id: number | null) => void;
  kardex: any[];
}

export function ProductKardexView({
  productos,
  productoSeleccionado,
  setProductoSeleccionado,
  kardex,
}: ProductKardexViewProps) {
  return (
    <div>
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Seleccionar Producto
        </label>
        <select
          value={productoSeleccionado || ""}
          onChange={(e) =>
            setProductoSeleccionado(Number(e.target.value) || null)
          }
          className="w-full max-w-md px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 bg-white"
        >
          <option value="">
            Selecciona un producto para ver su kardex
          </option>
          {productos.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre} ({p.codigo})
            </option>
          ))}
        </select>
      </div>

      {productoSeleccionado && kardex.length > 0 ? (
        <KardexTable data={kardex} />
      ) : productoSeleccionado ? (
        <EmptyState
          title="No hay movimientos para este producto"
          subtitle="Registra movimientos para ver el kardex"
        />
      ) : (
        <EmptyState
          title="Selecciona un producto para ver su kardex"
        />
      )}
    </div>
  );
}