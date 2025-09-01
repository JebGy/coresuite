import React, { useState } from "react";
import { Movimiento, Producto, Almacen, Proveedor } from "@/types";
import { ConstanciaRecepcionView } from "./ConstanciaRecepcionView";

interface MovementListProps {
  movimientos: Movimiento[];
  productos: Producto[];
  almacenes: Almacen[];
  proveedores?: Proveedor[];
}

export const MovementList: React.FC<MovementListProps> = ({
  movimientos,
  productos,
  almacenes,
  proveedores = [],
}) => {
  const [selectedMovimiento, setSelectedMovimiento] =
    useState<Movimiento | null>(null);
  const [showConstancia, setShowConstancia] = useState(false);

  const getProductName = (productoId: number) => {
    return productos.find((p) => p.id === productoId)?.nombre || "Producto";
  };

  const getAlmacenName = (almacenId: number) => {
    return almacenes.find((a) => a.id === almacenId)?.nombre || "N/A";
  };

  const groupMovimientosByDate = (movimientos: Movimiento[]) => {
    const grouped = movimientos.reduce((acc, movimiento) => {
      const fecha = movimiento.fecha;
      if (!acc[fecha]) {
        acc[fecha] = [];
      }
      acc[fecha].push(movimiento);
      return acc;
    }, {} as Record<string, Movimiento[]>);

    return Object.entries(grouped)
      .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
      .map(([fecha, movimientos]) => ({ fecha, movimientos }));
  };

  const EmptyState = () => (
    <div className="text-center py-8 text-gray-500">
      <svg
        className="w-12 h-12 mx-auto mb-4 text-gray-300"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
        />
      </svg>
      <p>No hay movimientos registrados</p>
    </div>
  );

  if (showConstancia && selectedMovimiento) {
    return (
      <ConstanciaRecepcionView
        movimiento={selectedMovimiento}
        productos={productos}
        almacenes={almacenes}
        proveedores={proveedores}
        onClose={() => {
          setShowConstancia(false);
          setSelectedMovimiento(null);
        }}
      />
    );
  }

  return (
    <div className="w-full bg-white rounded-lg shadow-md p-6 overflow-y-auto">
      <h2 className="text-xl font-semibold mb-4">Movimientos Recientes</h2>
      <div className="space-y-6">
        {movimientos.length === 0 ? (
          <EmptyState />
        ) : (
          groupMovimientosByDate(movimientos).map((group, groupIndex) => (
            <div
              key={groupIndex}
              className="border-b border-gray-200 pb-4 last:border-b-0"
            >
              <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold mr-2">
                  {group.movimientos.length}
                </span>
                {group.fecha}
              </h3>
              <div className="space-y-2">
                {group.movimientos.map((movimiento) => (
                  <div
                    key={movimiento.id}
                    className={`border border-gray-200 rounded-lg p-3 cursor-pointer transition-colors hover:shadow-md ${
                      selectedMovimiento?.id === movimiento.id
                        ? "bg-blue-50 border-blue-300 shadow-md"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => {
                      setSelectedMovimiento(movimiento);
                      if (movimiento.tipo === "entrada") {
                        setShowConstancia(true);
                      }
                    }}
                  >
                    <div className="flex items-center mb-1">
                      <div
                        className={`w-2 h-2 rounded-full mr-2 ${
                          movimiento.tipo === "entrada"
                            ? "bg-green-500"
                            : "bg-red-500"
                        }`}
                      />
                      <div className="font-semibold text-blue-600 text-sm">
                        {getProductName(movimiento.productoId)}
                      </div>
                    </div>
                    <div className="text-xs text-gray-600">
                      {movimiento.motivo}
                    </div>
                    <div className="text-xs truncate text-gray-500">
                      Almacén: {getAlmacenName(movimiento.almacenId)}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="text-xs text-gray-500">
                        Cant:
                        <span
                          className={`font-semibold ml-1 ${
                            movimiento.tipo === "entrada"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {movimiento.tipo === "entrada" ? "+" : "-"}
                          {movimiento.cantidad}
                        </span>
                      </div>
                      {movimiento.precioUnitario && (
                        <div className="text-xs text-gray-500">
                          S/ {movimiento.precioUnitario}
                        </div>
                      )}
                      
                    </div>
                    {movimiento.factura && movimiento.tipo === "entrada" && (
                      <div className="text-xs text-blue-600 mt-1">
                        Factura: {movimiento.factura}
                      </div>
                    )}
                    {movimiento.tipo === "entrada" && (
                      <div className="mt-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedMovimiento(movimiento);
                            setShowConstancia(true);
                          }}
                          className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1 rounded transition-colors"
                        >
                          Generar Constancia
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
