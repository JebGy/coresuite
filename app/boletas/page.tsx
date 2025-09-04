'use client';

import React, { useState } from 'react';
import BoletaView from '@/app/components/BoletaView';

const BoletasPage: React.FC = () => {
  const [tipoSeleccionado, setTipoSeleccionado] = useState<'orden-entrega' | 'traslado' | null>(null);

  const handleTipoChange = (tipo: 'orden-entrega' | 'traslado') => {
    setTipoSeleccionado(tipo);
  };

  const handleVolver = () => {
    setTipoSeleccionado(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Vista de Boletas
          </h1>
          <p className="text-gray-600">
            Visualiza e imprime las órdenes de entrega y traslados en formato de boleta
          </p>
        </div>

        {!tipoSeleccionado ? (
          /* Selector de tipo de documento */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div
              className="bg-white rounded-xl shadow-lg p-8 cursor-pointer hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-blue-500"
              onClick={() => handleTipoChange('orden-entrega')}
            >
              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-corporate-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Órdenes de Entrega
                </h3>
                <p className="text-gray-600">
                  Visualiza las boletas de entrega de productos solicitados por los trabajadores
                </p>
              </div>
            </div>

            <div
              className="bg-white rounded-xl shadow-lg p-8 cursor-pointer hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-green-500"
              onClick={() => handleTipoChange('traslado')}
            >
              <div className="text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Traslados
                </h3>
                <p className="text-gray-600">
                  Visualiza las guías de traslado de productos entre almacenes
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Vista de boletas */
          <div>
            <div className="mb-6">
              <button
                onClick={handleVolver}
                className="flex items-center space-x-2 text-corporate-primary hover:text-blue-800 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Volver al selector</span>
              </button>
            </div>
            
            <BoletaView tipo={tipoSeleccionado} />
          </div>
        )}
      </div>

      {/* Estilos para impresión */}
      <style jsx global>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
            background: white;
          }
          
          .print\:hidden {
            display: none !important;
          }
          
          .boleta-container {
            box-shadow: none !important;
            border: 1px solid #000 !important;
            margin: 0 !important;
            max-width: none !important;
            width: 100% !important;
          }
          
          .boleta-container * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          @page {
            margin: 0.5in;
            size: A4;
          }
        }
      `}</style>
    </div>
  );
};

export default BoletasPage;