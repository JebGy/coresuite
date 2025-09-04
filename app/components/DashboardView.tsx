import React from "react";
import { Almacen, Producto, Movimiento, UsuarioSession } from "@/types";

interface DashboardViewProps {
  trabajador: UsuarioSession;
  almacenes: Almacen[];
  productos: Producto[];
  movimientos: Movimiento[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  trabajador,
  almacenes,
  productos,
  movimientos,
}) => {
  // Componente de tarjeta de métrica
  const MetricCard = ({
    title,
    value,
    icon,
    color,
  }: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
  }) => (
    <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
        <div
          className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center`}
        >
          {icon}
        </div>
      </div>
    </div>
  );

  // Componente de gráfico simple
  const SimpleChart = ({
    data,
    title,
  }: {
    data: { label: string; value: number; color: string }[];
    title: string;
  }) => (
    <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="flex items-center">
            <div
              className="w-4 h-4 rounded-full mr-3"
              style={{ backgroundColor: item.color }}
            ></div>
            <span className="text-sm text-gray-600 flex-1">{item.label}</span>
            <span className="text-sm font-semibold text-gray-800">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  // Función para calcular valor total del inventario
  const calcularValorTotalInventario = (movimientos: Movimiento[]) => {
    let total = 0;

    movimientos.forEach((m) => {
      const cantidad = parseFloat(m.cantidad.toString()) || 0;
      const precioUnitario =
        parseFloat(m.precioUnitario?.toString() ?? "0") || 0;
      const tipo = (m.tipo || "").toLowerCase().trim();

      let valorMovimiento = 0;

      if (tipo === "entrada") {
        valorMovimiento = cantidad * precioUnitario;
      } else if (tipo === "salida") {
        valorMovimiento = -(cantidad * precioUnitario);
      }

      total += valorMovimiento;
    });

    return total;
  };

  // Cálculos para métricas
  const totalAlmacenes = almacenes.length;
  const totalProductos = productos.length;
  const totalMovimientos = movimientos.length;
  const entradas = movimientos.filter((m) => m.tipo === "entrada").length;
  const salidas = movimientos.filter((m) => m.tipo === "salida").length;
  const valorTotalInventario = calcularValorTotalInventario(movimientos);

  return (
    <div className="space-y-6 col-span-full">
      {/* Header del Dashboard */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Dashboard - {trabajador.nombres} -{" "}
            {trabajador.rol?.nombre || "Sin Rol"}
          </h1>
          <p className="text-gray-600">
            Resumen general del sistema de gestión
          </p>
        </div>
        <div className="flex items-center space-x-4"></div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Almacenes"
          value={totalAlmacenes}
          icon={
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          }
          color="bg-purple-500"
        />
        <MetricCard
          title="Total Productos"
          value={totalProductos}
          icon={
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          }
          color="bg-corporate-primary"
        />
        <MetricCard
          title="Total Movimientos"
          value={totalMovimientos}
          icon={
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
              />
            </svg>
          }
          color="bg-corporate-primary"
        />
        <MetricCard
          title="Valor Inventario"
          value={`S/ ${valorTotalInventario.toLocaleString()}`}
          icon={
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
              />
            </svg>
          }
          color="bg-purple-500"
        />
      </div>

      {/* Gráficos y análisis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SimpleChart
          title="Distribución de Movimientos"
          data={[
            { label: "Entradas", value: entradas, color: "#10b981" },
            { label: "Salidas", value: salidas, color: "#ef4444" },
          ]}
        />
        <div className="glass-effect rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Actividad Reciente
          </h3>
          <div className="space-y-3">
            {movimientos
              .slice(-5)
              .reverse()
              .map((mov) => (
                <div
                  key={mov.id}
                  className="flex items-center justify-between p-3 bg-white/50 rounded-lg"
                >
                  <div className="flex items-center">
                    <div
                      className={`w-3 h-3 rounded-full mr-3 ${
                        mov.tipo === "entrada"
                          ? "bg-green-500"
                          : "bg-red-500"
                      }`}
                    ></div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {productos.find((p) => p.id === mov.productoId)
                          ?.nombre || "Producto"}
                      </p>
                      <p className="text-xs text-gray-600">{mov.fecha}</p>
                    </div>
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      mov.tipo === "entrada"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {mov.tipo === "entrada" ? "+" : "-"}
                    {mov.cantidad}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};