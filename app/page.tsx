"use client";
import React, { useState, useEffect } from "react";
import { ReportCharts } from "./components/ReportCharts";
import { KardexTable } from "./components/kardexTable";
import { KardexConsolidadoTable } from "./components/KardexConsolidadoTable";
import {
  calcularKardex,
  calcularKardexPorAlmacen,
  calcularKardexConsolidado,
} from "@/lib/kardex";
import {
  Almacen,
  Producto,
  Movimiento,
  KardexRow,
  KardexConsolidado,
} from "@/types";
import { addAlmacen, getAlmacenes } from "./actions/AlmacenesActions";
import { addProudcto, getProductos } from "./actions/ProductosActions";
import { addMovimiento, getMovimientos } from "./actions/MovimientosActions";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

// Tipos de datos ya importados desde @/types

// Lógica de Kardex importada desde lib/kardex.ts

export default function Dashboard() {
  // Estados para productos y movimientos
  const [almacenes, setAlmacenes] = useState<Almacen[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [almacenForm, setAlmacenForm] = useState({
    nombre: "",
    ubicacion: "",
    descripcion: "",
  });
  const [productoForm, setProductoForm] = useState({
    codigo: "",
    nombre: "",
    descripcion: "",
    almacenId: 0,
  });
  const [movimientoForm, setMovimientoForm] = useState({
    tipo: "entrada" as "entrada" | "salida",
    fecha: new Date().toISOString().slice(0, 10),
    cantidad: 0,
    precioUnitario: 0,
    motivo: "",
    productoId: 0,
    almacenId: 0,
  });

  const router = useRouter();
  // Declarar el hook de sesión de NextAuth

  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Estado para la navegación
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Estados de carga
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Cargar datos al montar el componente
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        const [almacenesData, productosData, movimientosData] =
          await Promise.all([getAlmacenes(), getProductos(), getMovimientos()]);

        setAlmacenes(almacenesData);
        setProductos(productosData);
        setMovimientos(movimientosData);
      } catch (error) {
        console.error("Error al cargar datos:", error);
        alert(
          "Error al cargar los datos. Verifica la conexión a la base de datos."
        );
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  // Handlers para almacenes
  const handleAlmacenChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setAlmacenForm({ ...almacenForm, [e.target.name]: e.target.value });
  };

  const handleAlmacenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!almacenForm.nombre || !almacenForm.ubicacion) return;

    try {
      setSubmitting(true);
      await addAlmacen(almacenForm, session?.user?.id ? Number(session.user.id) : undefined);

      // Recargar almacenes
      const nuevosAlmacenes = await getAlmacenes();
      setAlmacenes(nuevosAlmacenes);

      setAlmacenForm({ nombre: "", ubicacion: "", descripcion: "" });
      alert("Almacén agregado exitosamente");
    } catch (error) {
      console.error("Error al agregar almacén:", error);
      alert("Error al agregar el almacén");
    } finally {
      setSubmitting(false);
    }
  };

  // Handlers para productos
  const handleProductoChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const value =
      e.target.name === "almacenId" ? Number(e.target.value) : e.target.value;
    setProductoForm({ ...productoForm, [e.target.name]: value });
  };

  const handleProductoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productoForm.codigo || !productoForm.nombre) return;

    try {
      setSubmitting(true);
      await addProudcto({
        id: 0, // El ID será asignado por la base de datos
        codigo: productoForm.codigo,
        nombre: productoForm.nombre,
        descripcion: productoForm.descripcion,
        almacenId: productoForm.almacenId || undefined,
      }, session?.user?.id ? Number(session.user.id) : undefined);

      // Recargar productos
      const nuevosProductos = await getProductos();
      setProductos(nuevosProductos);

      setProductoForm({
        codigo: "",
        nombre: "",
        descripcion: "",
        almacenId: 0,
      });
      alert("Producto agregado exitosamente");
    } catch (error) {
      console.error("Error al agregar producto:", error);
      alert("Error al agregar el producto");
    } finally {
      setSubmitting(false);
    }
  };

  // Handlers para movimientos
  const handleMovimientoChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setMovimientoForm({ ...movimientoForm, [e.target.name]: e.target.value });
  };

  const handleMovimientoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !movimientoForm.productoId ||
      !movimientoForm.cantidad ||
      !movimientoForm.fecha ||
      !movimientoForm.almacenId
    )
      return;

    try {
      setSubmitting(true);
      await addMovimiento({
        tipo: movimientoForm.tipo,
        fecha: movimientoForm.fecha,
        cantidad: Number(movimientoForm.cantidad),
        precioUnitario:
          movimientoForm.tipo === "entrada"
            ? Number(movimientoForm.precioUnitario)
            : undefined,
        motivo: movimientoForm.motivo,
        productoId: Number(movimientoForm.productoId),
        almacenId: Number(movimientoForm.almacenId),
      }, session?.user?.id ? Number(session.user.id) : undefined);

      // Recargar movimientos
      const nuevosMovimientos = await getMovimientos();
      setMovimientos(nuevosMovimientos);

      setMovimientoForm({
        ...movimientoForm,
        cantidad: 0,
        precioUnitario: 0,
        motivo: "",
      });
      alert("Movimiento registrado exitosamente");
    } catch (error) {
      console.error("Error al registrar movimiento:", error);
      alert("Error al registrar el movimiento");
    } finally {
      setSubmitting(false);
    }
  };

  // Estados para Kardex
  const [productoSeleccionado, setProductoSeleccionado] = useState<
    number | null
  >(null);
  const [almacenSeleccionado, setAlmacenSeleccionado] = useState<number | null>(
    null
  );
  const [tipoKardex, setTipoKardex] = useState<
    "producto" | "almacen" | "consolidado"
  >("producto");

  // Cálculos de Kardex
  const movimientosFiltrados = movimientos.filter(
    (m) => m.productoId === productoSeleccionado
  );
  const kardex = calcularKardex(movimientosFiltrados, almacenes);
  const kardexPorAlmacen = almacenSeleccionado
    ? calcularKardexPorAlmacen(movimientos, almacenSeleccionado, almacenes)
    : [];
  const kardexConsolidado = calcularKardexConsolidado(
    movimientos,
    productos,
    almacenes
  );

  // Cálculos para métricas
  const totalAlmacenes = almacenes.length;
  const totalProductos = productos.length;
  const totalMovimientos = movimientos.length;
  const entradas = movimientos.filter((m) => m.tipo === "entrada").length;
  const salidas = movimientos.filter((m) => m.tipo === "salida").length;
  const valorTotalInventario = movimientos
    .filter((m) => m.tipo === "entrada")
    .reduce((sum, m) => sum + m.cantidad * (m.precioUnitario ?? 0), 0);

  // Componente de navegación lateral
  const Sidebar = () => (
    <div
      className={`fixed left-0 top-0 w-72 h-full col-span-2 bg-white text-gray-800 p-6 overflow-y-auto z-50 transform transition-transform duration-300 ease-in-out border-r border-gray-200 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}
    >
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg flex items-center justify-center mr-3">
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
            </div>
            <h1 className="text-xl font-bold text-gray-800">Core Manager</h1>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-600 hover:text-gray-800"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <p className="text-gray-600 text-sm">Sistema de Gestión Empresarial</p>
      </div>

      <nav className="space-y-2">
        <button
          className={`flex items-center w-full px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-all duration-200 ${
            activeSection === "dashboard"
              ? "bg-blue-100 text-blue-700 border border-blue-200"
              : ""
          }`}
          onClick={() => {
            setActiveSection("dashboard");
            setSidebarOpen(false);
          }}
        >
          <svg
            className="w-5 h-5 mr-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z"
            />
          </svg>
          Dashboard
        </button>

        <button
          className={`flex items-center w-full px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-all duration-200 ${
            activeSection === "almacenes"
              ? "bg-blue-100 text-blue-700 border border-blue-200"
              : ""
          }`}
          onClick={() => {
            setActiveSection("almacenes");
            setSidebarOpen(false);
          }}
        >
          <svg
            className="w-5 h-5 mr-3"
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
          Almacenes
        </button>

        <button
          className={`flex items-center w-full px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-all duration-200 ${
            activeSection === "productos"
              ? "bg-blue-100 text-blue-700 border border-blue-200"
              : ""
          }`}
          onClick={() => {
            setActiveSection("productos");
            setSidebarOpen(false);
          }}
        >
          <svg
            className="w-5 h-5 mr-3"
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
          Productos
        </button>

        <button
          className={`flex items-center w-full px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-all duration-200 ${
            activeSection === "unidades"
              ? "bg-blue-100 text-blue-700 border border-blue-200"
              : ""
          }`}
          onClick={() => {
            setActiveSection("unidades");
            setSidebarOpen(false);
          }}
        >
          <svg
            className="w-5 h-5 mr-3"
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
          Unidades
        </button>

        <button
          className={`flex items-center w-full px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-all duration-200 ${
            activeSection === "trabajadores"
              ? "bg-blue-100 text-blue-700 border border-blue-200"
              : ""
          }`}
          onClick={() => {
            setActiveSection("trabajadores");
            setSidebarOpen(false);
          }}
        >
          <svg
            className="w-5 h-5 mr-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
            />
          </svg>
          Trabajadores
        </button>

        <button
          className={`flex items-center w-full px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-all duration-200 ${
            activeSection === "ordenes-entrega"
              ? "bg-blue-100 text-blue-700 border border-blue-200"
              : ""
          }`}
          onClick={() => {
            setActiveSection("ordenes-entrega");
            setSidebarOpen(false);
          }}
        >
          <svg
            className="w-5 h-5 mr-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Órdenes de Entrega
        </button>

        <button
          className={`flex items-center w-full px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-all duration-200 ${
            activeSection === "movimientos"
              ? "bg-blue-100 text-blue-700 border border-blue-200"
              : ""
          }`}
          onClick={() => {
            setActiveSection("movimientos");
            setSidebarOpen(false);
          }}
        >
          <svg
            className="w-5 h-5 mr-3"
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
          Movimientos
        </button>

        <button
          className={`flex items-center w-full px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-all duration-200 ${
            activeSection === "kardex"
              ? "bg-blue-100 text-blue-700 border border-blue-200"
              : ""
          }`}
          onClick={() => {
            setActiveSection("kardex");
            setSidebarOpen(false);
          }}
        >
          <svg
            className="w-5 h-5 mr-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Kardex
        </button>

        <button
          className={`flex items-center w-full px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-all duration-200 ${
            activeSection === "reportes"
              ? "bg-blue-100 text-blue-700 border border-blue-200"
              : ""
          }`}
          onClick={() => {
            setActiveSection("reportes");
            setSidebarOpen(false);
          }}
        >
          <svg
            className="w-5 h-5 mr-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          Reportes
        </button>

        <button
          className={`flex items-center w-full px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-all duration-200 ${
            activeSection === "logs"
              ? "bg-blue-100 text-blue-700 border border-blue-200"
              : ""
          }`}
          onClick={() => {
            window.location.href = "/logs";
            setSidebarOpen(false);
          }}
        >
          <svg
            className="w-5 h-5 mr-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 17v-2a4 4 0 014-4h3m4 4v6a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h6"
            />
          </svg>
          Logs del sistema
        </button>
      </nav>

      <div className="mt-auto pt-8">
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-4">
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-800">
              Sistema Activo
            </span>
          </div>
          <p className="text-xs text-gray-600">
            Última actualización: {new Date().toLocaleString("es-ES")}
          </p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1"
            />
          </svg>
          Cerrar sesión
        </button>
      </div>
    </div>
  );

  // Componente de métricas
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

  // Renderizado condicional basado en la sección activa
  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return (
          <div className="space-y-6 col-span-full">
            {/* Header del Dashboard */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
                <p className="text-gray-600">
                  Resumen general del sistema de gestión
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setActiveSection("reportes")}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  Reportes
                </button>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Nuevo Registro
                </button>
              </div>
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
                color="bg-blue-500"
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
                color="bg-green-500"
              />
              <MetricCard
                title="Valor Inventario"
                value={`$${valorTotalInventario.toLocaleString()}`}
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

      case "unidades":
        return (
          <div className="space-y-6 col-span-full">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  Gestión de Unidades
                </h1>
                <p className="text-gray-600">
                  Administra las unidades organizacionales
                </p>
              </div>
            </div>
            <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200">
              <p className="text-center text-gray-600 py-8">
                <a
                  href="/unidades"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  Ir a la página de Unidades
                </a>
              </p>
            </div>
          </div>
        );

      case "trabajadores":
        return (
          <div className="space-y-6 col-span-full">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  Gestión de Trabajadores
                </h1>
                <p className="text-gray-600">
                  Administra el personal de la empresa
                </p>
              </div>
            </div>
            <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200">
              <p className="text-center text-gray-600 py-8">
                <a
                  href="/trabajadores"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  Ir a la página de Trabajadores
                </a>
              </p>
            </div>
          </div>
        );

      case "ordenes-entrega":
        return (
          <div className="space-y-6 col-span-full">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  Órdenes de Entrega
                </h1>
                <p className="text-gray-600">
                  Gestiona las solicitudes de entrega de productos
                </p>
              </div>
            </div>
            <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200">
              <p className="text-center text-gray-600 py-8">
                <a
                  href="/ordenes-entrega"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  Ir a la página de Órdenes de Entrega
                </a>
              </p>
            </div>
          </div>
        );

      case "almacenes":
        return (
          <div className="space-y-6 col-span-full">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  Gestión de Almacenes
                </h1>
                <p className="text-gray-600">
                  Administra los almacenes de tu empresa
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Formulario de almacenes */}
              <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
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
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">
                    Nuevo Almacén
                  </h2>
                </div>

                <form onSubmit={handleAlmacenSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nombre del Almacén
                    </label>
                    <input
                      name="nombre"
                      placeholder="Ej: Almacén Principal"
                      value={almacenForm.nombre}
                      onChange={handleAlmacenChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Ubicación
                    </label>
                    <input
                      name="ubicacion"
                      placeholder="Ej: Calle Principal #123"
                      value={almacenForm.ubicacion}
                      onChange={handleAlmacenChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Descripción (opcional)
                    </label>
                    <textarea
                      name="descripcion"
                      placeholder="Descripción detallada del almacén"
                      value={almacenForm.descripcion}
                      onChange={handleAlmacenChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 bg-white"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Agregando...
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                        Agregar Almacén
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Lista de almacenes */}
              <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200">
                <h2 className="text-xl font-bold text-gray-800 mb-6">
                  Almacenes Registrados
                </h2>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {almacenes.map((almacen) => (
                    <div
                      key={almacen.id}
                      className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-800">
                            {almacen.nombre}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Ubicación: {almacen.ubicacion}
                          </p>
                          {almacen.descripcion && (
                            <p className="text-sm text-gray-500 mt-1">
                              {almacen.descripcion}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Activo
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {almacenes.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <svg
                        className="w-12 h-12 mx-auto mb-4 text-gray-300"
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
                      <p>No hay almacenes registrados</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case "productos":
        return (
          <div className="space-y-6 col-span-full">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  Gestión de Productos
                </h1>
                <p className="text-gray-600">
                  Administra el catálogo de productos
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Formulario de productos */}
              <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
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
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">
                    Nuevo Producto
                  </h2>
                </div>

                <form onSubmit={handleProductoSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Código del producto
                    </label>
                    <input
                      name="codigo"
                      placeholder="Ej: PROD-001"
                      value={productoForm.codigo}
                      onChange={handleProductoChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nombre del producto
                    </label>
                    <input
                      name="nombre"
                      placeholder="Nombre del producto"
                      value={productoForm.nombre}
                      onChange={handleProductoChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Descripción (opcional)
                    </label>
                    <input
                      name="descripcion"
                      placeholder="Descripción detallada"
                      value={productoForm.descripcion}
                      onChange={handleProductoChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Almacén (opcional)
                    </label>
                    <select
                      name="almacenId"
                      value={productoForm.almacenId}
                      onChange={handleProductoChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 bg-white"
                    >
                      <option value="0">Sin asignar</option>
                      {almacenes.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.nombre} ({a.ubicacion})
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Agregando...
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                        Agregar Producto
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Lista de productos */}
              <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200">
                <h2 className="text-xl font-bold text-gray-800 mb-6">
                  Productos Registrados
                </h2>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {productos.map((producto) => (
                    <div
                      key={producto.id}
                      className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-800">
                            {producto.nombre}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Código: {producto.codigo}
                          </p>
                          {producto.descripcion && (
                            <p className="text-sm text-gray-500 mt-1">
                              {producto.descripcion}
                            </p>
                          )}
                          {producto.almacenId && (
                            <p className="text-sm text-blue-600 mt-1">
                              Almacén:{" "}
                              {almacenes.find(
                                (a) => a.id === producto.almacenId
                              )?.nombre || "No encontrado"}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Activo
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {productos.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <svg
                        className="w-12 h-12 mx-auto mb-4 text-gray-300"
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
                      <p>No hay productos registrados</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case "movimientos":
        return (
          <div className="space-y-6 col-span-full">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  Gestión de Movimientos
                </h1>
                <p className="text-gray-600">
                  Registra entradas y salidas de inventario
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Formulario de movimientos */}
              <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center mr-3">
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
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">
                    Nuevo Movimiento
                  </h2>
                </div>

                <form onSubmit={handleMovimientoSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Producto
                    </label>
                    <select
                      name="productoId"
                      value={movimientoForm.productoId}
                      onChange={handleMovimientoChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 bg-white"
                      required
                    >
                      <option value="">Selecciona un producto</option>
                      {productos.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nombre} ({p.codigo})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Almacén
                    </label>
                    <select
                      name="almacenId"
                      value={movimientoForm.almacenId}
                      onChange={handleMovimientoChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 bg-white"
                      required
                    >
                      <option value="">Selecciona un almacén</option>
                      {almacenes.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.nombre} ({a.ubicacion})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Tipo
                      </label>
                      <select
                        name="tipo"
                        value={movimientoForm.tipo}
                        onChange={handleMovimientoChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 bg-white"
                      >
                        <option value="entrada">Entrada</option>
                        <option value="salida">Salida</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Fecha
                      </label>
                      <input
                        type="date"
                        name="fecha"
                        value={movimientoForm.fecha}
                        onChange={handleMovimientoChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 bg-white"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Cantidad
                      </label>
                      <input
                        type="number"
                        name="cantidad"
                        value={movimientoForm.cantidad}
                        onChange={handleMovimientoChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 bg-white"
                        required
                        min="1"
                      />
                    </div>

                    {movimientoForm.tipo === "entrada" && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Precio Unitario
                        </label>
                        <input
                          type="number"
                          name="precioUnitario"
                          value={movimientoForm.precioUnitario}
                          onChange={handleMovimientoChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 bg-white"
                          step="0.01"
                          min="0"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Motivo
                    </label>
                    <input
                      name="motivo"
                      placeholder="Motivo del movimiento"
                      value={movimientoForm.motivo}
                      onChange={handleMovimientoChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 bg-white"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Registrando...
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Registrar Movimiento
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Lista de movimientos */}
              <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200">
                <h2 className="text-xl font-bold text-gray-800 mb-6">
                  Movimientos Recientes
                </h2>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {movimientos
                    .slice()
                    .reverse()
                    .map((movimiento) => (
                      <div
                        key={movimiento.id}
                        className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center">
                              <div
                                className={`w-3 h-3 rounded-full mr-3 ${
                                  movimiento.tipo === "entrada"
                                    ? "bg-green-500"
                                    : "bg-red-500"
                                }`}
                              ></div>
                              <h3 className="font-semibold text-gray-800">
                                {productos.find(
                                  (p) => p.id === movimiento.productoId
                                )?.nombre || "Producto"}
                              </h3>
                            </div>
                            <p className="text-sm text-gray-600">
                              {movimiento.fecha} - {movimiento.motivo}
                            </p>
                            <p className="text-xs text-gray-500">
                              Almacén:{" "}
                              {almacenes.find(
                                (a) => a.id === movimiento.almacenId
                              )?.nombre || "N/A"}
                            </p>
                          </div>
                          <div className="text-right">
                            <span
                              className={`text-lg font-bold ${
                                movimiento.tipo === "entrada"
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {movimiento.tipo === "entrada" ? "+" : "-"}
                              {movimiento.cantidad}
                            </span>
                            {movimiento.precioUnitario && (
                              <p className="text-sm text-gray-500">
                                ${movimiento.precioUnitario}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  {movimientos.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <svg
                        className="w-12 h-12 mx-auto mb-4 text-gray-300"
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
                      <p>No hay movimientos registrados</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case "kardex":
        return (
          <div className="space-y-6 col-span-full">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Kardex</h1>
                <p className="text-gray-600">
                  Control de inventario valorizado por producto, almacén y
                  consolidado
                </p>
              </div>
            </div>

            {/* Selector de tipo de Kardex */}
            <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200">
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Tipo de Kardex
                </label>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setTipoKardex("producto")}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                      tipoKardex === "producto"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Por Producto
                  </button>
                  <button
                    onClick={() => setTipoKardex("almacen")}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                      tipoKardex === "almacen"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Por Almacén
                  </button>
                  <button
                    onClick={() => setTipoKardex("consolidado")}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                      tipoKardex === "consolidado"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Consolidado
                  </button>
                </div>
              </div>

              {/* Contenido según el tipo seleccionado */}
              {tipoKardex === "producto" && (
                <div>
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Seleccionar Producto
                    </label>
                    <select
                      value={productoSeleccionado || ""}
                      onChange={(e) =>
                        setProductoSeleccionado(Number(e.target.value) || null)
                      }
                      className="w-full max-w-md px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 bg-white"
                    >
                      <option value="">
                        Selecciona un producto para ver su kardex
                      </option>
                      {productos.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nombre} ({p.codigo})
                        </option>
                      ))}
                    </select>
                  </div>

                  {productoSeleccionado && kardex.length > 0 ? (
                    <KardexTable data={kardex} />
                  ) : productoSeleccionado ? (
                    <div className="text-center py-12 text-gray-500">
                      <svg
                        className="w-16 h-16 mx-auto mb-4 text-gray-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <p className="text-lg">
                        No hay movimientos para este producto
                      </p>
                      <p className="text-sm">
                        Registra movimientos para ver el kardex
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <svg
                        className="w-16 h-16 mx-auto mb-4 text-gray-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <p className="text-lg">
                        Selecciona un producto para ver su kardex
                      </p>
                    </div>
                  )}
                </div>
              )}

              {tipoKardex === "almacen" && (
                <div>
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Seleccionar Almacén
                    </label>
                    <select
                      value={almacenSeleccionado || ""}
                      onChange={(e) =>
                        setAlmacenSeleccionado(Number(e.target.value) || null)
                      }
                      className="w-full max-w-md px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 bg-white"
                    >
                      <option value="">
                        Selecciona un almacén para ver su kardex
                      </option>
                      {almacenes.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  {almacenSeleccionado && kardexPorAlmacen.length > 0 ? (
                    <KardexTable data={kardexPorAlmacen} />
                  ) : almacenSeleccionado ? (
                    <div className="text-center py-12 text-gray-500">
                      <svg
                        className="w-16 h-16 mx-auto mb-4 text-gray-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <p className="text-lg">
                        No hay movimientos para este almacén
                      </p>
                      <p className="text-sm">
                        Registra movimientos para ver el kardex
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <svg
                        className="w-16 h-16 mx-auto mb-4 text-gray-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <p className="text-lg">
                        Selecciona un almacén para ver su kardex
                      </p>
                    </div>
                  )}
                </div>
              )}

              {tipoKardex === "consolidado" && (
                <div>
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      Kardex Consolidado
                    </h3>
                    <p className="text-sm text-gray-600">
                      Vista consolidada de inventario por producto y almacén
                    </p>
                  </div>

                  {kardexConsolidado.length > 0 ? (
                    <KardexConsolidadoTable data={kardexConsolidado} />
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <svg
                        className="w-16 h-16 mx-auto mb-4 text-gray-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <p className="text-lg">No hay datos para mostrar</p>
                      <p className="text-sm">
                        Registra productos y movimientos para ver el kardex
                        consolidado
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );

      case "reportes":
        return (
          <div className="space-y-6 col-span-full">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  Reportes con Gráficos
                </h1>
                <p className="text-gray-600">
                  Análisis visual y exportación de datos
                </p>
              </div>
            </div>

            <ReportCharts
              movimientos={movimientos}
              productos={productos}
              almacenes={almacenes}
            />
          </div>
        );

      default:
        return null;
    }
  };

  // Mostrar pantalla de carga
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Cargando...
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Redirigiendo a la página de inicio de sesión...
      </div>
    );
  }

  return (
    <main className="grid grid-cols-12">
      <Sidebar />
      <span className="col-span-2"></span>
      <div className="col-span-10 grid grid-cols-12 pl-16 pr-8 pt-8">{renderContent()}</div>
    </main>
  );
}
