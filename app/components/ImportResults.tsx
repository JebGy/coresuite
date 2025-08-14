import React from 'react';

interface ImportResultsProps {
  resultado: {
    results: any;
    errors: any;
  };
}

export const ImportResults: React.FC<ImportResultsProps> = ({ resultado }) => {
  const hasErrors = resultado.errors && Object.keys(resultado.errors).length > 0;

  return (
    <div className="mt-6">
      <h3 className="text-lg font-bold text-gray-800 mb-2">
        Resumen de la importación
      </h3>
      
      <ResultsSummary results={resultado.results} />
      
      {hasErrors && <ErrorsDisplay errors={resultado.errors} />}
    </div>
  );
};

const ResultsSummary: React.FC<{ results: any }> = ({ results }) => (
  <div className="mb-4">
    {Object.entries(results || {}).map(([hoja, res]: any) => (
      <div key={hoja} className="mb-2">
        <span className="font-semibold text-blue-700">
          {hoja.charAt(0).toUpperCase() + hoja.slice(1)}:
        </span>{" "}
        {res.ok} registros importados, {res.fail} errores
      </div>
    ))}
  </div>
);

const ErrorsDisplay: React.FC<{ errors: any }> = ({ errors }) => (
  <div className="bg-red-50 border border-red-200 rounded p-4">
    <h4 className="font-semibold text-red-700 mb-2">
      Errores detectados:
    </h4>
    {Object.entries(errors).map(([hoja, errores]: any) => (
      <div key={hoja} className="mb-2">
        <span className="font-semibold text-red-600">
          {hoja.charAt(0).toUpperCase() + hoja.slice(1)}:
        </span>
        <ul className="list-disc list-inside text-sm text-red-700 mt-1">
          {(errores as string[]).map((err, idx) => (
            <li key={idx}>{err}</li>
          ))}
        </ul>
      </div>
    ))}
  </div>
);