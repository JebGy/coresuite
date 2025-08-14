import React from 'react';
import { ReportCharts } from './ReportCharts';
import { Almacen, Producto, Movimiento } from '@/types';

interface ReportesSectionProps {
  movimientos: Movimiento[];
  productos: Producto[];
  almacenes: Almacen[];
}

export const ReportesSection: React.FC<ReportesSectionProps> = ({
  movimientos,
  productos,
  almacenes
}) => {
  return (
    <div className="space-y-6 col-span-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Reportes con Gráficos
          </h1>
          <p className="text-gray-600">
            Análisis visual y exportación de datos
          </p>
        </div>
      </div>

      <ReportCharts
        movimientos={movimientos}
        productos={productos}
        almacenes={almacenes}
      />
    </div>
  );
};