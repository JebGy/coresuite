import React, { useRef, useState } from 'react';
import { ImportResults } from './ImportResults';

interface ImportSectionProps {
  onImport: (file: File) => Promise<void>;
  importando: boolean;
  resultadoImportacion: {
    results: any;
    errors: any;
  } | null;
}

export const ImportSection: React.FC<ImportSectionProps> = ({
  onImport,
  importando,
  resultadoImportacion
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const file = fileInputRef.current?.files?.[0];
    if (file) {
      await onImport(file);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Importar datos</h2>
      <form onSubmit={handleSubmit}>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          className="mb-4"
        />
        <button
          type="submit"
          disabled={importando}
          className="bg-corporate-primary hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 mr-2"
        >
          {importando ? "Importando..." : "Importar"}
        </button>
        <ImportInstructions />
      </form>
      {resultadoImportacion && (
        <ImportResults resultado={resultadoImportacion} />
      )}
    </div>
  );
};

const ImportInstructions: React.FC = () => (
  <div className="mt-2 text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded p-2">
    Para importar datos correctamente, utiliza como plantilla el archivo
    generado por la exportación. Así tendrás todos los campos y el formato
    exacto que espera el sistema.
  </div>
);