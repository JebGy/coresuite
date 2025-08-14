import React from 'react';

interface ExportSectionProps {
  onExport: () => Promise<void>;
  exportando: boolean;
}

export const ExportSection: React.FC<ExportSectionProps> = ({
  onExport,
  exportando
}) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Exportar datos</h2>
      <button
        disabled={exportando}
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
        onClick={onExport}
      >
        {exportando ? "Exportando..." : "Exportar todo a Excel"}
      </button>
    </div>
  );
};