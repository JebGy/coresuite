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
import * as XLSX from 'xlsx';

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
    const añoActual = new Date().getFullYear();

    movimientos.forEach(mov => {
      const fecha = new Date(mov.fecha);
      if (!isNaN(fecha.getTime()) && fecha.getFullYear() === añoActual) {
        const mes = fecha.getMonth();
        datos[mes]++;
      }
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

  // Eliminar tendenciaMovimientos

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
          {/* Ícono PDF */}
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Exportar PDF
        </button>
        <button
          onClick={exportarImagen}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition duration-200"
        >
          {/* Ícono Imagen */}
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect width="18" height="14" x="3" y="5" rx="2" strokeWidth="2" />
            <circle cx="8.5" cy="10.5" r="1.5" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 19l-5-5a2 2 0 00-2.828 0L7 19" />
          </svg>
          Exportar Imagen
        </button>
        <button
          onClick={() => {
            // Calcular stock por producto
            const stockPorProducto = productos.map(producto => {
              const movs = movimientos.filter(m => m.productoId === producto.id);
              let stock = 0;
              movs.forEach(m => {
                if (m.tipo === 'entrada') stock += m.cantidad;
                else stock -= m.cantidad;
              });
              return {
                'Código': producto.codigo,
                'Nombre': producto.nombre,
                'Descripción': producto.descripcion || '',
                'Almacén': almacenes.find(a => a.id === producto.almacenId)?.nombre || '',
                'Stock': stock
              };
            });
            const ws = XLSX.utils.json_to_sheet(stockPorProducto);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Stock Productos');
            XLSX.writeFile(wb, 'stock_productos.xlsx');
          }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition duration-200"
        >
          {/* Ícono Excel */}
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="3" y="4" width="18" height="16" rx="2" strokeWidth="2" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4 6m0 0l4-6" />
          </svg>
          Exportar Stock Excel
        </button>
        <button
          onClick={() => {
            // Kardex Consolidado: Producto, Código, Total Cantidad, Total Valor, Almacenes
            const kardexConsolidado = productos.map(producto => {
              const movs = movimientos.filter(m => m.productoId === producto.id);
              let totalCantidad = 0;
              let totalValor = 0;
              let almacenesSet = new Set();
              movs.forEach(m => {
                if (m.tipo === 'entrada') totalCantidad += m.cantidad;
                else totalCantidad -= m.cantidad;
                totalValor += (m.cantidad * (m.precioUnitario || 0)) * (m.tipo === 'entrada' ? 1 : -1);
                almacenesSet.add(m.almacenId);
              });
              return {
                'Producto': producto.nombre,
                'Código': producto.codigo,
                'Total Cantidad': totalCantidad,
                'Total Valor': totalValor,
                'Almacenes': almacenesSet.size
              };
            });
            const ws = XLSX.utils.json_to_sheet(kardexConsolidado);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Kardex Consolidado');
            XLSX.writeFile(wb, 'kardex_consolidado.xlsx');
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition duration-200"
        >
          {/* Ícono Tabla */}
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="3" y="5" width="18" height="14" rx="2" strokeWidth="2" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M9 21V5M15 21V5" />
          </svg>
          Exportar Kardex Consolidado Excel
        </button>
        <button
          onClick={() => {
            // Inventario Valorizado: Producto, Código, Almacén, Stock, Valor, Costo Promedio
            const valorizado: any[] = [];
            productos.forEach(producto => {
              almacenes.forEach(almacen => {
                const movs = movimientos.filter(m => m.productoId === producto.id && m.almacenId === almacen.id);
                let stock = 0;
                let valor = 0;
                let costoPromedio = 0;
                movs.forEach(m => {
                  if (m.tipo === 'entrada') {
                    stock += m.cantidad;
                    valor += m.cantidad * (m.precioUnitario || 0);
                  } else {
                    stock -= m.cantidad;
                    valor -= m.cantidad * costoPromedio;
                  }
                  costoPromedio = stock ? valor / stock : 0;
                });
                if (movs.length > 0) {
                  valorizado.push({
                    'Producto': producto.nombre,
                    'Código': producto.codigo,
                    'Almacén': almacen.nombre,
                    'Stock': stock,
                    'Valor': valor,
                    'Costo Promedio': costoPromedio
                  });
                }
              });
            });
            const ws = XLSX.utils.json_to_sheet(valorizado);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Inventario Valorizado');
            XLSX.writeFile(wb, 'inventario_valorizado.xlsx');
          }}
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition duration-200"
        >
          {/* Ícono Dinero/Gráfico */}
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="3" y="5" width="18" height="14" rx="2" strokeWidth="2" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 13v3m4-6v6m4-9v9" />
          </svg>
          Exportar Inventario Valorizado Excel
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