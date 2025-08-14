import React from 'react';
import { Movimiento, Producto, Almacen } from '@/types';

interface MovementListProps {
  movimientos: Movimiento[];
  productos: Producto[];
  almacenes: Almacen[];
}

export const MovementList: React.FC<MovementListProps> = ({
  movimientos,
  productos,
  almacenes
}) => {
  const getProductName = (productoId: number) => {
    return productos.find(p => p.id === productoId)?.nombre || 'Producto';
  };

  const getAlmacenName = (almacenId: number) => {
    return almacenes.find(a => a.id === almacenId)?.nombre || 'N/A';
  };

  const EmptyState = () => (
    <div className="text-center py-8 text-gray-500">
      <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
      </svg>
      <p>No hay movimientos registrados</p>
    </div>
  );

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Movimientos Recientes</h2>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {movimientos.length === 0 ? (
          <EmptyState />
        ) : (
          movimientos
            .slice()
            .reverse()
            .map((movimiento) => (
              <div key={movimiento.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center">
                      <div
                        className={`w-3 h-3 rounded-full mr-3 ${
                          movimiento.tipo === 'entrada' ? 'bg-green-500' : 'bg-red-500'
                        }`}
                      />
                      <h3 className="font-semibold text-gray-800">
                        {getProductName(movimiento.productoId)}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      {movimiento.fecha} - {movimiento.motivo}
                      {movimiento.factura && movimiento.tipo === 'entrada' && (
                        <span className="ml-2 text-xs text-blue-600">
                          Factura: {movimiento.factura}
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500">
                      Almacén: {getAlmacenName(movimiento.almacenId)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-lg font-bold ${
                        movimiento.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {movimiento.tipo === 'entrada' ? '+' : '-'}{movimiento.cantidad}
                    </span>
                    {movimiento.precioUnitario && (
                      <p className="text-sm text-gray-500">S/ {movimiento.precioUnitario}</p>
                    )}
                  </div>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
};