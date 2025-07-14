"use client";
import React from "react";

export default function KardexPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Sistema Kardex
          </h1>
          
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-4">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Módulo de Kardex
            </h2>
            <p className="text-gray-600 mb-6">
              Aquí podrás gestionar y visualizar el kardex de todos los productos.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800">
                <strong>Funcionalidades próximas:</strong>
              </p>
              <ul className="text-blue-700 mt-2 space-y-1">
                <li>• Visualización de kardex por producto</li>
                <li>• Reportes de movimientos</li>
                <li>• Análisis de costos promedio</li>
                <li>• Exportación de datos</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 