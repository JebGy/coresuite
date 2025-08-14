import React from "react";
import { KardexTable } from "./kardexTable";
import { EmptyState } from "./EmptyState";
import { Almacen } from "@/types";

interface AlmacenKardexViewProps {
  almacenes: Almacen[];
  almacenSeleccionado: number | null;
  setAlmacenSeleccionado: (id: number | null) => void;
  kardexPorAlmacen: any[];
}

export function AlmacenKardexView({
  almacenes,
  almacenSeleccionado,
  setAlmacenSeleccionado,
  kardexPorAlmacen,
}: AlmacenKardexViewProps) {
  return (
    <div>
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Seleccionar Almacén
        </label>
        <select
          value={almacenSeleccionado || ""}
          onChange={(e) =>
            setAlmacenSeleccionado(Number(e.target.value) || null)
          }
          className="w-full max-w-md px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 bg-white"
        >
          <option value="">
            Selecciona un almacén para ver su kardex
          </option>
          {almacenes.map((a) => (
            <option key={a.id} value={a.id}>
              {a.nombre}
            </option>
          ))}
        </select>
      </div>

      {almacenSeleccionado && kardexPorAlmacen.length > 0 ? (
        <KardexTable data={kardexPorAlmacen} />
      ) : almacenSeleccionado ? (
        <EmptyState
          title="No hay movimientos para este almacén"
          subtitle="Registra movimientos para ver el kardex"
        />
      ) : (
        <EmptyState
          title="Selecciona un almacén para ver su kardex"
        />
      )}
    </div>
  );
}