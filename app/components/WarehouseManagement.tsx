import React from 'react';
import { Almacen } from '@/types';
import { WarehouseForm } from './WarehouseForm';
import { WarehouseList } from './WarehouseList';

interface WarehouseManagementProps {
  almacenes: Almacen[];
  almacenForm: {
    nombre: string;
    ubicacion: string;
    descripcion: string;
  };
  submitting: boolean;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export const WarehouseManagement: React.FC<WarehouseManagementProps> = ({
  almacenes,
  almacenForm,
  submitting,
  onSubmit,
  onChange,
}) => {
  return (
    <div className="space-y-6 col-span-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Gestión de Almacenes
          </h1>
          <p className="text-gray-600">
            Administra los almacenes de tu empresa
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <WarehouseForm
          almacenForm={almacenForm}
          submitting={submitting}
          onSubmit={onSubmit}
          onChange={onChange}
        />
        <WarehouseList almacenes={almacenes} />
      </div>
    </div>
  );
};