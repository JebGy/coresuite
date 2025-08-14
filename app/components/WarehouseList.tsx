import React from 'react';
import { Almacen } from '@/types';

interface WarehouseListProps {
  almacenes: Almacen[];
}

export const WarehouseList: React.FC<WarehouseListProps> = ({ almacenes }) => {
  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200">
      <h2 className="text-xl font-bold text-gray-800 mb-6">
        Almacenes Registrados
      </h2>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {almacenes.map((almacen) => (
          <div
            key={almacen.id}
            className="bg-gray-50 rounded-lg p-4 border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-800">
                  {almacen.nombre}
                </h3>
                <p className="text-sm text-gray-600">
                  Ubicación: {almacen.ubicacion}
                </p>
                {almacen.descripcion && (
                  <p className="text-sm text-gray-500 mt-1">
                    {almacen.descripcion}
                  </p>
                )}
              </div>
              <div className="text-right">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Activo
                </span>
              </div>
            </div>
          </div>
        ))}
        {almacenes.length === 0 && (
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
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
            <p>No hay almacenes registrados</p>
          </div>
        )}
      </div>
    </div>
  );
};