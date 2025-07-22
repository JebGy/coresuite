"use client";
import React, { useState, useEffect, useRef } from "react";
import { ReportCharts } from "../components/ReportCharts";
import { KardexTable } from "../components/kardexTable";
import { KardexConsolidadoTable } from "../components/KardexConsolidadoTable";
import {
  calcularKardex,
  calcularKardexPorAlmacen,
  calcularKardexConsolidado,
} from "@/lib/kardex";
import { Almacen, Producto, Movimiento } from "@/types";
import { addAlmacen, getAlmacenes } from "../actions/AlmacenesActions";
import { addProudcto, getProductos } from "../actions/ProductosActions";
import { addMovimiento, getMovimientos } from "../actions/MovimientosActions";
import { useRouter } from "next/navigation";
import { Notificacion } from "../components/Notificacion";
import { useUser } from "../context/UserContext";

// Tipos de datos ya importados desde @/types

// Lógica de Kardex importada desde lib/kardex.ts

export default function Dashboard() {
  // Estados para productos y movimientos
  const [almacenes, setAlmacenes] = useState<Almacen[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10; // Número de items por página
  const [almacenForm, setAlmacenForm] = useState({
    nombre: "",
    ubicacion: "",
    descripcion: "",
  });
  const [productoForm, setProductoForm] = useState({
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
    factura: "",
    productoId: 0,
    almacenId: 0,
  });

  const router = useRouter();
  const user = useUser(); // Using our new UserContext

  // Estado para la navegación
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Estados de carga
  const [submitting, setSubmitting] = useState(false);

  // Estado para notificación
  const [notificacion, setNotificacion] = useState<{
    mensaje: string;
    tipo?: "exito" | "error" | "info";
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importando, setImportando] = useState(false);
  const [exportando, setExportando] = useState(false);
  // Estado para resultados de importación
  const [resultadoImportacion, setResultadoImportacion] = useState<null | {
    results: any;
    errors: any;
  }>(null);

  // Cargar datos al montar el componente
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [almacenesData, productosData, movimientosData] =
          await Promise.all([getAlmacenes(), getProductos(), getMovimientos()]);

        if (
          almacenesData.success &&
          almacenesData.data &&
          productosData.success &&
          productosData.data
        ) {
          setAlmacenes(almacenesData.data);
          setProductos(productosData.data);
        }
        setMovimientos(movimientosData);
      } catch (error) {
        console.error("Error al cargar datos:", error);
        setNotificacion({
          mensaje:
            "Error al cargar los datos. Verifica la conexión a la base de datos.",
          tipo: "error",
        });
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
      await addAlmacen(almacenForm, user.id);

      // Recargar almacenes
      const nuevosAlmacenes = await getAlmacenes();
      if (nuevosAlmacenes.success && nuevosAlmacenes.data) {
        setAlmacenes(nuevosAlmacenes.data);
      }

      setAlmacenForm({ nombre: "", ubicacion: "", descripcion: "" });
      setNotificacion({
        mensaje: "Almacén agregado exitosamente",
        tipo: "exito",
      });
    } catch (error) {
      console.error("Error al agregar almacén:", error);
      setNotificacion({
        mensaje: "Error al agregar el almacén",
        tipo: "error",
      });
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
    if (!productoForm.nombre || !productoForm.almacenId) {
      setNotificacion({
        mensaje:
          "Por favor ingrese el nombre del producto y seleccione un almacén",
        tipo: "error",
      });
      return;
    }

    try {
      setSubmitting(true);
      await addProudcto(
        {
          id: 0, // El ID será asignado por la base de datos
          codigo: "", // El código será generado automáticamente
          nombre: productoForm.nombre,
          descripcion: productoForm.descripcion,
          almacenId: productoForm.almacenId || undefined,
        },
        user.id
      );

      // Recargar productos
      const nuevosProductos = await getProductos();
      if (nuevosProductos.success && nuevosProductos.data) {
        setProductos(nuevosProductos.data);
      }

      setProductoForm({
        nombre: "",
        descripcion: "",
        almacenId: 0,
      });
      setNotificacion({
        mensaje: "Producto agregado exitosamente",
        tipo: "exito",
      });
    } catch (error) {
      console.error("Error al agregar producto:", error);
      setNotificacion({
        mensaje: "Error al agregar el producto",
        tipo: "error",
      });
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
      await addMovimiento(
        {
          tipo: movimientoForm.tipo,
          fecha: movimientoForm.fecha,
          cantidad: Number(movimientoForm.cantidad),
          precioUnitario:
            movimientoForm.tipo === "entrada"
              ? Number(movimientoForm.precioUnitario)
              : undefined,
          motivo: movimientoForm.motivo,
          factura:
            movimientoForm.tipo === "entrada"
              ? movimientoForm.factura
              : undefined,
          productoId: Number(movimientoForm.productoId),
          almacenId: Number(movimientoForm.almacenId),
        },
        user.id
      );

      // Recargar movimientos
      const nuevosMovimientos = await getMovimientos();
      setMovimientos(nuevosMovimientos);

      setMovimientoForm({
        ...movimientoForm,
        cantidad: 0,
        precioUnitario: 0,
        motivo: "",
        factura: "",
      });
      setNotificacion({
        mensaje: "Movimiento registrado exitosamente",
        tipo: "exito",
      });
    } catch (error) {
      console.error("Error al registrar movimiento:", error);
      setNotificacion({
        mensaje: "Error al registrar el movimiento",
        tipo: "error",
      });
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

  // Función para importar datos
  const handleImportar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileInputRef.current?.files?.[0]) return;
    setImportando(true);
    setResultadoImportacion(null);
    try {
      const res = await fetch("/api/import-export", {
        method: "POST",
        body: fileInputRef.current.files[0],
      });
      if (res.ok) {
        const data = await res.json();
        setNotificacion({ mensaje: "Importación exitosa", tipo: "exito" });
        setResultadoImportacion({ results: data.results, errors: data.errors });
      } else {
        let mensaje = "Error al importar datos";
        try {
          const data = await res.json();
          if (data.error) mensaje = data.error;
        } catch {}
        setNotificacion({ mensaje, tipo: "error" });
      }
    } catch (err) {
      setNotificacion({ mensaje: "Error de red al importar", tipo: "error" });
    } finally {
      setImportando(false);
    }
  };

  // Función para exportar datos
  const handleExportar = async () => {
    setExportando(true);
    try {
      const res = await fetch("/api/import-export");
      if (!res.ok) throw new Error("Error al exportar");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "exportacion_completa.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setNotificacion({ mensaje: "Error al exportar datos", tipo: "error" });
    } finally {
      setExportando(false);
    }
  };

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
            activeSection === "traslados"
              ? "bg-blue-100 text-blue-700 border border-blue-200"
              : ""
          }`}
          onClick={() => {
            router.push("/traslados");
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
              d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
            />
          </svg>
          Traslados
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

        <button
          className={`flex items-center w-full px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-all duration-200 ${
            activeSection === "import-export"
              ? "bg-blue-100 text-blue-700 border border-blue-200"
              : ""
          }`}
          onClick={() => {
            setActiveSection("import-export");
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
              d="M12 4v16m8-8H4"
            />
          </svg>
          Importar/Exportar
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
          onClick={() => {
            /* No sign out needed for ROOT user */
          }}
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
        // Filtrar productos basado en la búsqueda
        const filteredProducts = productos.filter(
          (producto) =>
            producto.codigo
              ?.toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            producto.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
            producto.descripcion
              ?.toLowerCase()
              .includes(searchQuery.toLowerCase())
        );

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

              {/* Buscador de productos */}
              <div className="bg-white col-span-full rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="mb-6">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Buscar por código, nombre o descripción..."
                      className="w-full px-4 py-2 pl-10 pr-4 text-gray-700 bg-white border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Lista de productos */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Código
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Nombre
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Descripción
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Almacén
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Estado
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredProducts
                        .slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage)
                        .map((producto) => (
                        <tr key={producto.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {producto.codigo}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {producto.nombre}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {producto.descripcion || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {almacenes.find((a) => a.id === producto.almacenId)
                              ?.nombre || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Activo
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {/* Paginación */}
                  <div className="mt-4 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                    <div className="flex flex-1 justify-between sm:hidden">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                        disabled={currentPage === 0}
                        className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Anterior
                      </button>
                      <button
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        disabled={(currentPage + 1) * itemsPerPage >= filteredProducts.length}
                        className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Siguiente
                      </button>
                    </div>
                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-700">
                          Mostrando <span className="font-medium">{currentPage * itemsPerPage + 1}</span> a{' '}
                          <span className="font-medium">
                            {Math.min((currentPage + 1) * itemsPerPage, filteredProducts.length)}
                          </span>{' '}
                          de <span className="font-medium">{filteredProducts.length}</span> resultados
                        </p>
                      </div>
                      <div>
                        <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                          <button
                            onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                            disabled={currentPage === 0}
                            className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                          >
                            <span className="sr-only">Anterior</span>
                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                              <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            disabled={(currentPage + 1) * itemsPerPage >= filteredProducts.length}
                            className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                          >
                            <span className="sr-only">Siguiente</span>
                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                              <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </nav>
                      </div>
                    </div>
                  </div>
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
                      onChange={(e) => {
                        handleMovimientoChange(e);
                        // Buscar el producto seleccionado y asignar su almacenId automáticamente
                        const prod = productos.find(
                          (p) => p.id === Number(e.target.value)
                        );
                        setMovimientoForm((prev) => ({
                          ...prev,
                          productoId: Number(e.target.value),
                          almacenId: prod?.almacenId || 0,
                        }));
                      }}
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
                    <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-900">
                      {(() => {
                        const prod = productos.find(
                          (p) => p.id === movimientoForm.productoId
                        );
                        if (!prod) return "Selecciona un producto";
                        const almacen = almacenes.find(
                          (a) => a.id === prod.almacenId
                        );
                        return almacen
                          ? `${almacen.nombre} (${almacen.ubicacion})`
                          : "Sin almacén asignado";
                      })()}
                    </div>
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

                  {movimientoForm.tipo === "entrada" && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Factura (opcional)
                      </label>
                      <input
                        type="text"
                        name="factura"
                        value={movimientoForm.factura}
                        onChange={handleMovimientoChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 bg-white"
                        placeholder="Número de factura"
                      />
                    </div>
                  )}

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
                              {movimiento.factura &&
                                movimiento.tipo === "entrada" && (
                                  <span className="ml-2 text-xs text-blue-600">
                                    Factura: {movimiento.factura}
                                  </span>
                                )}
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
                                S/ {movimiento.precioUnitario}
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

      case "import-export":
        return (
          <div className="space-y-6 col-span-full">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  Importar/Exportar
                </h1>
                <p className="text-gray-600">
                  Importa datos desde un archivo Excel o exporta toda la
                  información del sistema.
                </p>
              </div>
            </div>
            <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200 flex flex-col gap-6">
              <div>
                <h2 className="text-xl font-semibold mb-2">Importar datos</h2>
                <form onSubmit={handleImportar}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    className="mb-4"
                  />
                  <button
                    type="submit"
                    disabled={importando}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 mr-2"
                  >
                    {importando ? "Importando..." : "Importar"}
                  </button>
                  <div className="mt-2 text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded p-2">
                    Para importar datos correctamente, utiliza como plantilla el
                    archivo generado por la exportación. Así tendrás todos los
                    campos y el formato exacto que espera el sistema.
                  </div>
                </form>
                {/* Mostrar resumen y errores de importación */}
                {resultadoImportacion && (
                  <div className="mt-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-2">
                      Resumen de la importación
                    </h3>
                    <div className="mb-4">
                      {Object.entries(resultadoImportacion.results || {}).map(
                        ([hoja, res]: any) => (
                          <div key={hoja} className="mb-2">
                            <span className="font-semibold text-blue-700">
                              {hoja.charAt(0).toUpperCase() + hoja.slice(1)}:
                            </span>{" "}
                            {res.ok} registros importados, {res.fail} errores
                          </div>
                        )
                      )}
                    </div>
                    {resultadoImportacion.errors &&
                      Object.keys(resultadoImportacion.errors).length > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded p-4">
                          <h4 className="font-semibold text-red-700 mb-2">
                            Errores detectados:
                          </h4>
                          {Object.entries(resultadoImportacion.errors).map(
                            ([hoja, errores]: any) => (
                              <div key={hoja} className="mb-2">
                                <span className="font-semibold text-red-600">
                                  {hoja.charAt(0).toUpperCase() + hoja.slice(1)}
                                  :
                                </span>
                                <ul className="list-disc list-inside text-sm text-red-700 mt-1">
                                  {(errores as string[]).map((err, idx) => (
                                    <li key={idx}>{err}</li>
                                  ))}
                                </ul>
                              </div>
                            )
                          )}
                        </div>
                      )}
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">Exportar datos</h2>
                <button
                  disabled={exportando}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                  onClick={handleExportar}
                >
                  {exportando ? "Exportando..." : "Exportar todo a Excel"}
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Root user is always authenticated
  return (
    <main className="grid grid-cols-12">
      <Sidebar />
      <span className="col-span-2"></span>
      <div className="col-span-10 grid grid-cols-12 pl-16 pr-8 pt-8">
        {renderContent()}
      </div>
      {notificacion && (
        <Notificacion
          mensaje={notificacion.mensaje}
          tipo={notificacion.tipo}
          onClose={() => setNotificacion(null)}
        />
      )}
    </main>
  );
}
