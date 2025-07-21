"use client";
import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

interface ReportChartsProps {
  movimientos: any[];
  productos: any[];
  almacenes: any[];
}

export const ReportCharts: React.FC<ReportChartsProps> = ({ movimientos, productos, almacenes }) => {
  // Datos para gráficos
  const movimientosPorMes = React.useMemo(() => {
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const datos = new Array(12).fill(0);
    
    movimientos.forEach(mov => {
      const mes = new Date(mov.fecha).getMonth();
      datos[mes]++;
    });
    
    return {
      labels: meses,
      datasets: [
        {
          label: 'Movimientos',
          data: datos,
          backgroundColor: '#3b82f6',
          borderColor: '#1d4ed8',
          borderWidth: 1,
        },
      ],
    };
  }, [movimientos]);

  const movimientosPorTipo = React.useMemo(() => {
    const entradas = movimientos.filter(m => m.tipo === 'entrada').length;
    const salidas = movimientos.filter(m => m.tipo === 'salida').length;
    
    return {
      labels: ['Entradas', 'Salidas'],
      datasets: [
        {
          data: [entradas, salidas],
          backgroundColor: [
            '#22c55e',
            '#ef4444',
          ],
          borderColor: [
            '#16a34a',
            '#dc2626',
          ],
          borderWidth: 2,
        },
      ],
    };
  }, [movimientos]);

  const productosMasMovidos = React.useMemo(() => {
    const movimientosPorProducto = productos.map(producto => {
      const movs = movimientos.filter(m => m.productoId === producto.id);
      return {
        nombre: producto.nombre,
        cantidad: movs.length,
      };
    }).sort((a, b) => b.cantidad - a.cantidad).slice(0, 5);

    return {
      labels: movimientosPorProducto.map(p => p.nombre),
      datasets: [
        {
          label: 'Movimientos',
          data: movimientosPorProducto.map(p => p.cantidad),
          backgroundColor: 'rgba(168, 85, 247, 0.8)',
          borderColor: 'rgba(168, 85, 247, 1)',
          borderWidth: 1,
        },
      ],
    };
  }, [movimientos, productos]);

  const valorInventarioPorAlmacen = React.useMemo(() => {
    const valorPorAlmacen = almacenes.map(almacen => {
      const movs = movimientos.filter(m => m.almacenId === almacen.id && m.tipo === 'entrada');
      const valor = movs.reduce((sum, m) => sum + (m.cantidad * (m.precioUnitario || 0)), 0);
      return {
        nombre: almacen.nombre,
        valor: valor,
      };
    });

    return {
      labels: valorPorAlmacen.map(a => a.nombre),
      datasets: [
        {
          label: 'Valor del Inventario (S/)',
          data: valorPorAlmacen.map(a => a.valor),
          backgroundColor: 'rgba(245, 158, 11, 0.8)',
          borderColor: 'rgba(245, 158, 11, 1)',
          borderWidth: 1,
        },
      ],
    };
  }, [movimientos, almacenes]);

  const tendenciaMovimientos = React.useMemo(() => {
    const ultimos7Dias = Array.from({ length: 7 }, (_, i) => {
      const fecha = new Date();
      fecha.setDate(fecha.getDate() - i);
      return fecha.toISOString().slice(0, 10);
    }).reverse();

    const datos = ultimos7Dias.map(fecha => {
      const movs = movimientos.filter(m => m.fecha === fecha);
      return movs.length;
    });

    return {
      labels: ultimos7Dias.map(fecha => new Date(fecha).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })),
      datasets: [
        {
          label: 'Movimientos',
          data: datos,
          borderColor: '#3b82f6',
          backgroundColor: '#dbeafe',
          fill: true,
          tension: 0.4,
        },
      ],
    };
  }, [movimientos]);

  // Función para exportar reporte
  const exportarReporte = async () => {
    const reporteElement = document.getElementById('reporte-container');
    if (!reporteElement) return;

    try {
      const canvas = await html2canvas(reporteElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const imgWidth = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save('reporte-Core Manager.pdf');
    } catch (error) {
      console.error('Error al exportar:', error);
      alert('Error al exportar el reporte');
    }
  };

  // Función para exportar como imagen
  const exportarImagen = async () => {
    const reporteElement = document.getElementById('reporte-container');
    if (!reporteElement) return;

    try {
      const canvas = await html2canvas(reporteElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
      });

      const link = document.createElement('a');
      link.download = 'reporte-Core Manager.png';
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('Error al exportar:', error);
      alert('Error al exportar la imagen');
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#1f2937',
          font: {
            size: 12,
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#6b7280',
        },
        grid: {
          color: '#e5e7eb',
        },
      },
      y: {
        ticks: {
          color: '#6b7280',
        },
        grid: {
          color: '#e5e7eb',
        },
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Botones de exportación */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={exportarReporte}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition duration-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Exportar PDF
        </button>
        <button
          onClick={exportarImagen}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition duration-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Exportar Imagen
        </button>
      </div>

      {/* Contenedor del reporte */}
      <div id="reporte-container" className="bg-white p-8 rounded-lg shadow-lg space-y-8">
        {/* Título del reporte */}
        <div className="text-center border-b border-gray-200 pb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reporte Core Manager</h1>
          <p className="text-gray-600">Generado el {new Date().toLocaleDateString('es-ES')}</p>
        </div>

        {/* Resumen ejecutivo */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="text-sm font-medium text-blue-800">Total Almacenes</h3>
            <p className="text-2xl font-bold text-blue-900">{almacenes.length}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 className="text-sm font-medium text-green-800">Total Productos</h3>
            <p className="text-2xl font-bold text-green-900">{productos.length}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <h3 className="text-sm font-medium text-purple-800">Total Movimientos</h3>
            <p className="text-2xl font-bold text-purple-900">{movimientos.length}</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <h3 className="text-sm font-medium text-orange-800">Valor Inventario (S/)</h3>
            <p className="text-2xl font-bold text-orange-900">
              S/ {movimientos
                .filter(m => m.tipo === 'entrada')
                .reduce((sum, m) => sum + (m.cantidad * (m.precioUnitario || 0)), 0)
                .toLocaleString()}
            </p>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Movimientos por mes */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Movimientos por Mes</h3>
            <div className="h-64">
              <Bar data={movimientosPorMes} options={chartOptions} />
            </div>
          </div>

          {/* Distribución de movimientos */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución de Movimientos</h3>
            <div className="h-64">
              <Doughnut data={movimientosPorTipo} options={chartOptions} />
            </div>
          </div>

          {/* Productos más movidos */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Productos con Más Movimientos</h3>
            <div className="h-64">
              <Bar data={productosMasMovidos} options={chartOptions} />
            </div>
          </div>

          {/* Valor por almacén */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Valor del Inventario por Almacén</h3>
            <div className="h-64">
              <Bar data={valorInventarioPorAlmacen} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Tendencia de movimientos */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tendencia de Movimientos (Últimos 7 días)</h3>
          <div className="h-64">
            <Line data={tendenciaMovimientos} options={chartOptions} />
          </div>
        </div>

        {/* Tabla de resumen */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen de Almacenes</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Almacén</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ubicación</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Movimientos</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Inventario</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {almacenes.map((almacen) => {
                  const movs = movimientos.filter(m => m.almacenId === almacen.id);
                  const valor = movs
                    .filter(m => m.tipo === 'entrada')
                    .reduce((sum, m) => sum + (m.cantidad * (m.precioUnitario || 0)), 0);
                  
                  return (
                    <tr key={almacen.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{almacen.nombre}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{almacen.ubicacion}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{movs.length}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">S/ {valor.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}; 