"use client"
import React, { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Movimiento, Producto, Almacen, Proveedor } from '@/types';
import { ConstanciaRecepcionTemplate } from './ConstanciaRecepcionTemplate';

interface ConstanciaRecepcionViewProps {
  movimiento: Movimiento;
  productos: Producto[];
  almacenes: Almacen[];
  proveedores?: Proveedor[];
  onGenerate?: (constanciaData: any) => void;
  onClose?: () => void;
}

export const ConstanciaRecepcionView: React.FC<ConstanciaRecepcionViewProps> = ({
  movimiento,
  productos,
  almacenes,
  proveedores = [],
  onGenerate,
  onClose
}) => {
  const getProductName = (productoId: number) => {
    return productos.find((p) => p.id === productoId)?.nombre || "Producto";
  };

  const getAlmacenName = (almacenId: number) => {
    return almacenes.find((a) => a.id === almacenId)?.nombre || "N/A";
  };
  const [formData, setFormData] = useState({
    proveedorId: '',
    numeroGuia: movimiento.factura || '',
    agenciaTransporte: '',
    numeroGuiaAgencia: '',
    observaciones: movimiento.motivo || ''
  });
  const [loading, setLoading] = useState(false);
  const [constanciaData, setConstanciaData] = useState<any>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleGenerateConstancia = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/constancia-recepcion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          movimientoId: movimiento.id,
          ...formData
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setConstanciaData(result.data);
        if (onGenerate) {
          onGenerate(result.data);
        }
      } else {
        console.error('Error:', result.error);
      }
    } catch (error) {
      console.error('Error generando constancia:', error);
    } finally {
      setLoading(false);
    }
  };

 const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({
    contentRef,
    pageStyle: `
      @page {
        size: A4 landscape;
        margin: 20mm;
      }
      
    `,
  });



  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">
            Constancia de Recepción de Materiales
          </h2>
          {onClose && (
            <button
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
            >
              ← Volver
            </button>
          )}
        </div>
        <p className="text-gray-600">
          Movimiento #{movimiento.id} - {getProductName(movimiento.productoId)}
        </p>
        <p className="text-gray-500 text-sm">
          Almacén: {getAlmacenName(movimiento.almacenId)}
        </p>
      </div>

      {!constanciaData ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Proveedor
              </label>
              <select
                name="proveedorId"
                value={formData.proveedorId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar proveedor</option>
                {proveedores.map((proveedor) => (
                  <option key={proveedor.id} value={proveedor.id}>
                    {proveedor.nombre} - {proveedor.ruc}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de Guía
              </label>
              <input
                type="text"
                name="numeroGuia"
                value={formData.numeroGuia}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Número de guía o factura"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Agencia de Transporte
              </label>
              <input
                type="text"
                name="agenciaTransporte"
                value={formData.agenciaTransporte}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nombre de la agencia"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de Guía de Agencia
              </label>
              <input
                type="text"
                name="numeroGuiaAgencia"
                value={formData.numeroGuiaAgencia}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Número de guía de transporte"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observaciones
            </label>
            <textarea
              name="observaciones"
              value={formData.observaciones}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Observaciones adicionales"
            />
          </div>

          <button
            onClick={handleGenerateConstancia}
            disabled={loading}
            className="w-full bg-corporate-primary hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200 flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Generando Constancia...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Generar Constancia de Recepción
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-green-800 font-medium">
                Constancia de recepción generada exitosamente
              </span>
            </div>
          </div>

          <div className="flex justify-center no-print">
            <button
              onClick={reactToPrintFn}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-md font-medium transition-colors duration-200 flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Imprimir Constancia
            </button>
          </div>

          <button
            onClick={() => setConstanciaData(null)}
            className="w-full bg-corporate-primary hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200 no-print"
          >
            Generar Nueva Constancia
          </button>

          {/* Preview de la constancia */}
          <div className="border border-gray-300 rounded-md p-4 bg-gray-50">
            <h3 className="text-lg font-medium text-gray-800 mb-2 no-print">Vista Previa:</h3>
            <div 
              ref={contentRef}
              className="bg-white rounded-md max-h-96 overflow-y-auto print:max-h-none print:overflow-visible print:border-none print:shadow-none"

            >
              {(() => {
                 const producto = productos.find(p => p.id === movimiento.productoId);
                 const proveedor = proveedores.find(p => p.id === parseInt(formData.proveedorId));
                 
                 console.log('Renderizando template:', {
                   producto,
                   proveedor,
                   movimiento,
                   formData
                 });
                 
                 return producto ? (
                   <ConstanciaRecepcionTemplate
                     movimiento={{
                       ...movimiento,
                       producto
                     }}
                     proveedor={proveedor}
                     numeroGuia={formData.numeroGuia}
                     agenciaTransporte={formData.agenciaTransporte}
                     numeroGuiaAgencia={formData.numeroGuiaAgencia}
                     observaciones={formData.observaciones}
                   />
                 ) : (
                   <div className="text-red-500 p-4">
                     Error: No se pudo encontrar el producto asociado al movimiento.
                     <br />Producto ID: {movimiento.productoId}
                     <br />Productos disponibles: {productos.map(p => p.id).join(', ')}
                   </div>
                 );
               })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
