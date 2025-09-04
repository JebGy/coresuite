import React from "react";

interface KardexTypeSelectorProps {
  tipoKardex: "producto" | "almacen" | "consolidado";
  setTipoKardex: (tipo: "producto" | "almacen" | "consolidado") => void;
}

export function KardexTypeSelector({ tipoKardex, setTipoKardex }: KardexTypeSelectorProps) {
  return (
    <div className="mb-6">
      <label className="block text-sm font-semibold text-gray-700 mb-3">
        Tipo de Kardex
      </label>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setTipoKardex("producto")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
            tipoKardex === "producto"
              ? "bg-corporate-primary text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Por Producto
        </button>
        <button
          onClick={() => setTipoKardex("almacen")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
            tipoKardex === "almacen"
              ? "bg-corporate-primary text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Por Almacén
        </button>
        <button
          onClick={() => setTipoKardex("consolidado")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
            tipoKardex === "consolidado"
              ? "bg-corporate-primary text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Consolidado
        </button>
      </div>
    </div>
  );
}