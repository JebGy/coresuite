"use client";
import React from "react";

export default function RecursosHumanosPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Recursos Humanos
          </h1>
          
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-4">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Gestión de Personal
            </h2>
            <p className="text-gray-600 mb-6">
              Módulo para la gestión integral de recursos humanos de la empresa.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800">
                <strong>Funcionalidades próximas:</strong>
              </p>
              <ul className="text-green-700 mt-2 space-y-1">
                <li>• Gestión de empleados</li>
                <li>• Control de asistencia</li>
                <li>• Nómina y salarios</li>
                <li>• Evaluaciones de desempeño</li>
                <li>• Capacitaciones</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 