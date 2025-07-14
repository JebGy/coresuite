"use client";
import React from "react";

export default function CotizacionesPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Cotizaciones
          </h1>
          
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-4">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Gestión de Cotizaciones
            </h2>
            <p className="text-gray-600 mb-6">
              Sistema para crear y gestionar cotizaciones para clientes.
            </p>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-purple-800">
                <strong>Funcionalidades próximas:</strong>
              </p>
              <ul className="text-purple-700 mt-2 space-y-1">
                <li>• Creación de cotizaciones</li>
                <li>• Gestión de productos y precios</li>
                <li>• Aprobación de cotizaciones</li>
                <li>• Seguimiento de estado</li>
                <li>• Generación de PDF</li>
                <li>• Historial de cotizaciones</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 