import React from 'react';
import { MovementForm } from './MovementForm';
import { MovementList } from './MovementList';
import { Producto, Almacen, Movimiento } from '@/types';

interface MovementManagementProps {
  productos: Producto[];
  almacenes: Almacen[];
  movimientos: Movimiento[];
  onSubmitMovement: (formData: any) => Promise<void>;
  submitting: boolean;
}

export const MovementManagement: React.FC<MovementManagementProps> = ({
  productos,
  almacenes,
  movimientos,
  onSubmitMovement,
  submitting
}) => {
  return (
    <div className="space-y-6 col-span-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Gestión de Movimientos</h1>
          <p className="text-gray-600">Registra entradas y salidas de inventario</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <MovementForm
          productos={productos}
          almacenes={almacenes}
          onSubmit={onSubmitMovement}
          submitting={submitting}
        />
        <MovementList
          movimientos={movimientos}
          productos={productos}
          almacenes={almacenes}
        />
      </div>
    </div>
  );
};