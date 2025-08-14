import React from "react";
import { KardexConsolidadoTable } from "./KardexConsolidadoTable";
import { EmptyState } from "./EmptyState";

interface ConsolidatedViewProps {
  kardexConsolidado: any[];
}

export function ConsolidatedView({ kardexConsolidado }: ConsolidatedViewProps) {
  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Kardex Consolidado
        </h3>
        <p className="text-sm text-gray-600">
          Vista consolidada de inventario por producto y almacén
        </p>
      </div>

      {kardexConsolidado.length > 0 ? (
        <KardexConsolidadoTable data={kardexConsolidado} />
      ) : (
        <EmptyState
          title="No hay datos para mostrar"
          subtitle="Registra productos y movimientos para ver el kardex consolidado"
        />
      )}
    </div>
  );
}