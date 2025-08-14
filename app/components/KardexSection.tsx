"use client";
import React, { useState } from "react";
import { AlmacenKardexView } from "./AlmacenKardexView";
import { ConsolidatedView } from "./ConsolidatedView";
import {
  calcularKardex,
  calcularKardexPorAlmacen,
  calcularKardexConsolidado,
} from "@/lib/kardex";
import { Almacen, Producto, Movimiento } from "@/types";
import { KardexTypeSelector } from "./KardexTypeSelector";
import { ProductKardexView } from "./ProductKardexView";

interface KardexSectionProps {
  productos: Producto[];
  almacenes: Almacen[];
  movimientos: Movimiento[];
}

export function KardexSection({ productos, almacenes, movimientos }: KardexSectionProps) {
  const [productoSeleccionado, setProductoSeleccionado] = useState<number | null>(null);
  const [almacenSeleccionado, setAlmacenSeleccionado] = useState<number | null>(null);
  const [tipoKardex, setTipoKardex] = useState<"producto" | "almacen" | "consolidado">("producto");

  // Cálculos de Kardex
  const movimientosFiltrados = movimientos.filter(
    (m) => m.productoId === productoSeleccionado
  );
  const kardex = calcularKardex(movimientosFiltrados, almacenes);
  const kardexPorAlmacen = almacenSeleccionado
    ? calcularKardexPorAlmacen(movimientos, almacenSeleccionado, almacenes)
    : [];
  const kardexConsolidado = calcularKardexConsolidado(
    movimientos,
    productos,
    almacenes
  );

  return (
    <div className="space-y-6 col-span-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Kardex</h1>
          <p className="text-gray-600">
            Control de inventario valorizado por producto, almacén y consolidado
          </p>
        </div>
      </div>

      <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200">
        <KardexTypeSelector tipoKardex={tipoKardex} setTipoKardex={setTipoKardex} />

        {tipoKardex === "producto" && (
          <ProductKardexView
            productos={productos}
            productoSeleccionado={productoSeleccionado}
            setProductoSeleccionado={setProductoSeleccionado}
            kardex={kardex}
          />
        )}

        {tipoKardex === "almacen" && (
          <AlmacenKardexView
            almacenes={almacenes}
            almacenSeleccionado={almacenSeleccionado}
            setAlmacenSeleccionado={setAlmacenSeleccionado}
            kardexPorAlmacen={kardexPorAlmacen}
          />
        )}

        {tipoKardex === "consolidado" && (
          <ConsolidatedView kardexConsolidado={kardexConsolidado} />
        )}
      </div>
    </div>
  );
}