import React from 'react';
import { MovementForm } from './MovementForm';
import { MovementList } from './MovementList';
import { Producto, Almacen, Movimiento, Proveedor, ConstanciaRecepcion } from '@/types';
import { ConstanciaRecepcionView } from './ConstanciaRecepcionView';
import { useUser } from '../context/UserContext';

interface MovementManagementProps {
  productos: Producto[];
  almacenes: Almacen[];
  movimientos: Movimiento[];
  proveedores: Proveedor[];
  onSubmitMovement: (formData: any) => Promise<any>;
  submitting: boolean;
}

export const MovementManagement: React.FC<MovementManagementProps> = ({
  productos,
  almacenes,
  movimientos,
  proveedores,
  onSubmitMovement,
  submitting
}) => {
  const trabajador = useUser();
  return (
    <div className="space-y-6 col-span-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Gestión de Movimientos - {trabajador.unidad}</h1>
          <p className="text-gray-600">Registra entradas y salidas de inventario</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
       
        <MovementList
          movimientos={movimientos}
          productos={productos}
          almacenes={almacenes}
          proveedores={proveedores}
        />
         <MovementForm
          productos={productos}
          almacenes={almacenes}
          onSubmit={onSubmitMovement}
          submitting={submitting}
        />

        
      </div>
    </div>
  );
};