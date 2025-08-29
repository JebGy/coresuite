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
import {
  Almacen,
  Producto,
  Movimiento,
  Trabajador,
  UsuarioSession,
} from "@/types";
import { addAlmacen, getAlmacenes } from "../actions/AlmacenesActions";
import { addProudcto, getProductos, updateProducto } from "../actions/ProductosActions";
import { addMovimiento, getMovimientos } from "../actions/MovimientosActions";
import { useRouter } from "next/navigation";
import { Notificacion } from "../components/Notificacion";
import { useUser } from "../context/UserContext";
import { ReportesSection } from "../components/ReportesSection";
import { ImportSection } from "../components/ImportSection";
import { ExportSection } from "../components/ExportSection";
import { KardexSection } from "../components/KardexSection";
import { MovementManagement } from "../components/MovementManagement";
import { DashboardView } from "../components/DashboardView";
import { WarehouseManagement } from "../components/WarehouseManagement";
import ProveedoresView from "../components/ProveedoresView";
import ImportExportHeader from "../components/ImportExportHeader";

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
  
  // Estados para edición de productos
  const [editingProduct, setEditingProduct] = useState<Producto | null>(null);
  const [isEditing, setIsEditing] = useState(false);
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

  // Estado para autocompletado de producto en movimientos
  const [productoInput, setProductoInput] = useState("");
  const [sugerenciasProducto, setSugerenciasProducto] = useState<Producto[]>(
    []
  );
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const inputProductoRef = useRef<HTMLInputElement>(null);

  // Estados para formulario de traslados en dashboard
  const [productoInputTraslado, setProductoInputTraslado] = useState("");
  const [sugerenciasProductoTraslado, setSugerenciasProductoTraslado] =
    useState<Producto[]>([]);
  const [mostrarSugerenciasTraslado, setMostrarSugerenciasTraslado] =
    useState(false);
  const [selectedOrigin, setSelectedOrigin] = useState("");
  const [selectedDestination, setSelectedDestination] = useState("");
  const [quantityTraslado, setQuantityTraslado] = useState("");
  const [observationsTraslado, setObservationsTraslado] = useState("");

  // Autocompletado para traslado
  useEffect(() => {
    if (productoInputTraslado.trim() === "") {
      setSugerenciasProductoTraslado([]);
      return;
    }
    const sugerencias = productos.filter(
      (p) =>
        p.nombre.toLowerCase().includes(productoInputTraslado.toLowerCase()) ||
        p.codigo?.toLowerCase().includes(productoInputTraslado.toLowerCase())
    );
    setSugerenciasProductoTraslado(sugerencias);
  }, [productoInputTraslado, productos]);

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

  // Lógica para filtrar sugerencias de productos
  useEffect(() => {
    if (productoInput.trim() === "") {
      setSugerenciasProducto([]);
      return;
    }
    const sugerencias = productos.filter(
      (p) =>
        p.nombre.toLowerCase().includes(productoInput.toLowerCase()) ||
        p.codigo?.toLowerCase().includes(productoInput.toLowerCase())
    );
    setSugerenciasProducto(sugerencias);
  }, [productoInput, productos]);

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

  // Funciones para edición de productos
  const handleEditProduct = (producto: Producto) => {
    setEditingProduct(producto);
    setIsEditing(true);
    setProductoForm({
      nombre: producto.nombre,
      descripcion: producto.descripcion || "",
      almacenId: producto.almacenId || 0,
    });
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setIsEditing(false);
    setProductoForm({
      nombre: "",
      descripcion: "",
      almacenId: 0,
    });
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !productoForm.nombre) {
      setNotificacion({
        mensaje: "Por favor ingrese el nombre del producto",
        tipo: "error",
      });
      return;
    }

    try {
      setSubmitting(true);
      await updateProducto(
        {
          id: editingProduct.id,
          codigo: editingProduct.codigo,
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

      handleCancelEdit();
      setNotificacion({
        mensaje: "Producto actualizado exitosamente",
        tipo: "exito",
      });
    } catch (error) {
      console.error("Error al actualizar producto:", error);
      setNotificacion({
        mensaje: "Error al actualizar el producto",
        tipo: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleImportFile = async (file: File) => {
    setImportando(true);
    setResultadoImportacion(null);

    try {
      const res = await fetch("/api/import-export", {
        method: "POST",
        body: file,
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

  // Handlers para movimientos
  const handleMovimientoChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setMovimientoForm({ ...movimientoForm, [e.target.name]: e.target.value });
  };

  const handleMovimientoSubmit = async (formData: any) => {
    if (
      !formData.productoId ||
      !formData.cantidad ||
      !formData.fecha ||
      !formData.almacenId
    )
      return;

    try {
      setSubmitting(true);
      await addMovimiento(
        {
          tipo: formData.tipo,
          fecha: formData.fecha,
          cantidad: Number(formData.cantidad),
          precioUnitario:
            formData.tipo === "entrada"
              ? Number(formData.precioUnitario)
              : undefined,
          motivo: formData.motivo,
          factura:
            formData.tipo === "entrada"
              ? formData.factura
              : undefined,
          productoId: Number(formData.productoId),
          almacenId: Number(formData.almacenId),
        },
        user.id
      );

      // Recargar movimientos
      const nuevosMovimientos = await getMovimientos();
      setMovimientos(nuevosMovimientos);

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

  function calcularValorTotalInventario(
    movimientos: Movimiento[],
    debug = false
  ) {
    let total = 0;

    movimientos.forEach((m, index) => {
      // Conversión segura
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

      if (debug) {
        console.log(
          `#${
            index + 1
          } Tipo:${tipo}, Cant:${cantidad}, Precio:${precioUnitario}, Valor:${valorMovimiento}`
        );
      }
    });

    return total;
  }
  const entradas = movimientos.filter((m) => m.tipo === "entrada").length;
  const salidas = movimientos.filter((m) => m.tipo === "salida").length;
  const valorTotalInventario = calcularValorTotalInventario(movimientos);

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

        {trabajador.rol?.permisos?.puedeGestionarInventario && (
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
        )}
        {trabajador.rol?.permisos?.puedeGestionarInventario && (
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
        )}
        {trabajador.rol?.permisos?.puedeGestionarInventario && (
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
        )}

        {trabajador.rol?.permisos?.puedeEditarUsuarios && (
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
        )}

        {trabajador.rol?.permisos.puedeGestionarInventario && (
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
        )}

        {trabajador.rol?.permisos.puedeCrearOrdenes && (
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
        )}
        {trabajador.rol?.permisos.puedeGestionarInventario && (
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
        )}
        {trabajador.rol?.permisos.puedeGestionarInventario && (
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
        )}
        {trabajador.rol?.permisos.puedeGestionarInventario && (
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
        )}
        {trabajador.rol?.permisos.puedeGestionarInventario && (
          <button
            className={`flex items-center w-full px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-all duration-200 ${
              activeSection === "proveedores"
                ? "bg-blue-100 text-blue-700 border border-blue-200"
                : ""
            }`}
            onClick={() => {
              setActiveSection("proveedores");
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
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            Proveedores
          </button>
        )}
        {trabajador.rol?.permisos.accesoTotal && (
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
        )}
        {trabajador.rol?.permisos?.puedeVerReportes && (
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
        )}

        {trabajador.rol?.permisos?.puedeEditarUsuarios && (
          <button
            className={`flex items-center w-full px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-all duration-200 ${
              activeSection === "recursoshumanos"
                ? "bg-blue-100 text-blue-700 border border-blue-200"
                : ""
            }`}
            onClick={() => {
              setActiveSection("recursoshumanos");
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
            Recursos Humanos
          </button>
        )}
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
            fetch("/api/auth/logout", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
            }).then((v) => {
              if (v.ok) {
                router.replace("/login");
              }
            });
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

  const [trabajador, setTrabajador] = useState<UsuarioSession>({
    id: 0,
    nombres: "",
    apellidos: "",
    email: "",
    rolId: 0,
    rol: {
      id: 0,
      nombre: "",
      descripcion: "",
      permisos: {
        accesoTotal: false,
        puedeCrearOrdenes: false,
        puedeEditarUsuarios: false,
        puedeGestionarInventario: false,
        puedeVerReportes: false,
      },
    },
  });

  useEffect(() => {
    fetch("/api/auth/me", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }).then((v) => {
      v.json().then((v) => setTrabajador(v.datos as UsuarioSession));
    });
  }, [trabajador.nombres]);

  // Renderizado condicional basado en la sección activa
  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return (
          <DashboardView
            trabajador={trabajador}
            almacenes={almacenes}
            productos={productos}
            movimientos={movimientos}
          />
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
           <WarehouseManagement
            almacenes={almacenes}
            almacenForm={almacenForm}
            submitting={submitting}
            onSubmit={handleAlmacenSubmit}
            onChange={handleAlmacenChange}
          />
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
                    {isEditing ? "Editar Producto" : "Nuevo Producto"}
                  </h2>
                </div>

                <form onSubmit={isEditing ? handleUpdateProduct : handleProductoSubmit} className="space-y-4">
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

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
                    >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        {isEditing ? "Actualizando..." : "Agregando..."}
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
                            d={isEditing ? "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" : "M12 6v6m0 0v6m0-6h6m-6 0H6"}
                          />
                        </svg>
                        {isEditing ? "Actualizar Producto" : "Agregar Producto"}
                       </>
                     )}
                   </button>
                   {isEditing && (
                     <button
                       type="button"
                       onClick={handleCancelEdit}
                       disabled={submitting}
                       className="px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors duration-200 flex items-center justify-center"
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
                           d="M6 18L18 6M6 6l12 12"
                         />
                       </svg>
                       Cancelar
                     </button>
                   )}
                 </div>
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
                        <div className="text-right flex flex-col items-end space-y-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Activo
                          </span>
                          <button
                            onClick={() => handleEditProduct(producto)}
                            className="text-blue-600 hover:text-blue-900 flex items-center text-sm"
                          >
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                            Editar
                          </button>
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
                          Stock Total
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Estado
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredProducts
                        .slice(
                          currentPage * itemsPerPage,
                          (currentPage + 1) * itemsPerPage
                        )
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
                              {almacenes.find(
                                (a) => a.id === producto.almacenId
                              )?.nombre || "-"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                              {(() => {
                                const movs = movimientos.filter(
                                  (m) => m.productoId === producto.id
                                );
                                let stock = 0;
                                movs.forEach((m) => {
                                  if (m.tipo === "entrada") stock += m.cantidad;
                                  else stock -= m.cantidad;
                                });
                                return stock;
                              })()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                Activo
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => handleEditProduct(producto)}
                                className="text-blue-600 hover:text-blue-900 flex items-center"
                              >
                                <svg
                                  className="w-4 h-4 mr-1"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                  />
                                </svg>
                                Editar
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>

                  {/* Paginación */}
                  <div className="mt-4 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                    <div className="flex flex-1 justify-between sm:hidden">
                      <button
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(0, prev - 1))
                        }
                        disabled={currentPage === 0}
                        className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Anterior
                      </button>
                      <button
                        onClick={() => setCurrentPage((prev) => prev + 1)}
                        disabled={
                          (currentPage + 1) * itemsPerPage >=
                          filteredProducts.length
                        }
                        className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Siguiente
                      </button>
                    </div>
                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-700">
                          Mostrando{" "}
                          <span className="font-medium">
                            {currentPage * itemsPerPage + 1}
                          </span>{" "}
                          a{" "}
                          <span className="font-medium">
                            {Math.min(
                              (currentPage + 1) * itemsPerPage,
                              filteredProducts.length
                            )}
                          </span>{" "}
                          de{" "}
                          <span className="font-medium">
                            {filteredProducts.length}
                          </span>{" "}
                          resultados
                        </p>
                      </div>
                      <div>
                        <nav
                          className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                          aria-label="Pagination"
                        >
                          <button
                            onClick={() =>
                              setCurrentPage((prev) => Math.max(0, prev - 1))
                            }
                            disabled={currentPage === 0}
                            className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                          >
                            <span className="sr-only">Anterior</span>
                            <svg
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              aria-hidden="true"
                            >
                              <path
                                fillRule="evenodd"
                                d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => setCurrentPage((prev) => prev + 1)}
                            disabled={
                              (currentPage + 1) * itemsPerPage >=
                              filteredProducts.length
                            }
                            className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                          >
                            <span className="sr-only">Siguiente</span>
                            <svg
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              aria-hidden="true"
                            >
                              <path
                                fillRule="evenodd"
                                d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                                clipRule="evenodd"
                              />
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
          <MovementManagement
            productos={productos}
            almacenes={almacenes}
            movimientos={movimientos}
            onSubmitMovement={handleMovimientoSubmit}
            submitting={submitting}
          />
        );

      case "kardex":
        return (
          <KardexSection
            productos={productos}
            almacenes={almacenes}
            movimientos={movimientos}
          />
        );

      case "reportes":
        return (
          <ReportesSection
            movimientos={movimientos}
            productos={productos}
            almacenes={almacenes}
          />
        );

        case "proveedores":
          return (
            <ProveedoresView/>
          );


      case "import-export":
        return (
          <div className="space-y-6 col-span-full">
            <ImportExportHeader />
            <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200 flex flex-col gap-6">
              <ImportSection
                onImport={handleImportFile}
                importando={importando}
                resultadoImportacion={resultadoImportacion}
              />
              <ExportSection
                onExport={handleExportar}
                exportando={exportando}
              />
            </div>
          </div>
        );

      case "recursoshumanos":
        return (
          <div className="space-y-6 col-span-full">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  Recursos Humanos
                </h1>
                <p className="text-gray-600">
                  Gestión y administración del personal de la empresa
                </p>
              </div>
            </div>
            <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200">
              <p className="text-center text-gray-600 py-8">
                <a
                  href="/recursoshumanos"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  Ir a la página de Recursos Humanos
                </a>
              </p>
            </div>
          </div>
        );

      case "boletas":
        return (
          <div className="space-y-6 col-span-full">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  Boletas
                </h1>
                <p className="text-gray-600">
                  Visualiza órdenes de entrega y traslados en formato de boleta
                </p>
              </div>
            </div>
            <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200">
              <p className="text-center text-gray-600 py-8">
                <a
                  href="/boletas"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  Ir a la página de Boletas
                </a>
              </p>
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
