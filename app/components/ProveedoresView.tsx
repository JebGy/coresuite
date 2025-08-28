import React, { useState, useEffect } from "react";
import { Proveedor, Segmento } from "@/types";
import {
  getProveedores,
  addProveedor,
  getRucData,
} from "@/app/actions/ProveedoresActions";
import * as XLSX from "xlsx";

import { Notificacion } from "./Notificacion";
import { addSegmento, getSegmentos } from "../actions/SegmentosActions";

interface ProveedorFormData {
  ruc: string;
  nombre: string;
  telefono: string;
  email: string;
  detalles: string;
  mesesCredito: string; // Nuevo campo para meses de crédito
  segmentoId: number;
}

interface SegmentoFormData {
  nombre: string;
  descripcion: string;
}

function ProveedoresView() {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [segmentos, setSegmentos] = useState<Segmento[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submittingSegmento, setSubmittingSegmento] = useState(false);
  const [validatingRuc, setValidatingRuc] = useState(false);
  const [showSegmentoForm, setShowSegmentoForm] = useState(false);
  const [notificacion, setNotificacion] = useState<{
    mensaje: string;
    tipo: "success" | "error";
  } | null>(null);

  // Estados para filtrado
  const [filtros, setFiltros] = useState({
    busqueda: "",
    segmentoId: 0,
    conCredito: "todos", // "todos", "con", "sin"
  });
  const [proveedoresFiltrados, setProveedoresFiltrados] = useState<Proveedor[]>([]);

  const [formData, setFormData] = useState<ProveedorFormData>({
    ruc: "",
    nombre: "",
    telefono: "",
    detalles: "",
    email: "",
    mesesCredito: "", // Nuevo campo
    segmentoId: 0,
  });

  const [segmentoFormData, setSegmentoFormData] = useState<SegmentoFormData>({
    nombre: "",
    descripcion: "",
  });

  // Cargar datos al montar el componente
  useEffect(() => {
    loadData();
  }, []);

  // Aplicar filtros cuando cambien los proveedores o filtros
  useEffect(() => {
    aplicarFiltros();
  }, [proveedores, filtros]);

  const aplicarFiltros = () => {
    let resultado = [...proveedores];

    // Filtro por búsqueda (RUC, nombre, teléfono, email)
    if (filtros.busqueda.trim()) {
      const busqueda = filtros.busqueda.toLowerCase().trim();
      resultado = resultado.filter(
        (proveedor) =>
          proveedor.ruc.toLowerCase().includes(busqueda) ||
          proveedor.nombre.toLowerCase().includes(busqueda) ||
          (proveedor.telefono && proveedor.telefono.toLowerCase().includes(busqueda)) ||
          (proveedor.email && proveedor.email.toLowerCase().includes(busqueda))
      );
    }

    // Filtro por segmento
    if (filtros.segmentoId > 0) {
      resultado = resultado.filter(
        (proveedor) => proveedor.segmentoId === filtros.segmentoId
      );
    }

    // Filtro por crédito
    if (filtros.conCredito === "con") {
      resultado = resultado.filter(
        (proveedor) => proveedor.mesesCredito && proveedor.mesesCredito > 0
      );
    } else if (filtros.conCredito === "sin") {
      resultado = resultado.filter(
        (proveedor) => !proveedor.mesesCredito || proveedor.mesesCredito === 0
      );
    }

    setProveedoresFiltrados(resultado);
  };

  const limpiarFiltros = () => {
    setFiltros({
      busqueda: "",
      segmentoId: 0,
      conCredito: "todos",
    });
  };

  const loadData = async () => {
    try {
      const [proveedoresData, segmentosData] = await Promise.all([
        getProveedores(),
        getSegmentos(),
      ]);
      setProveedores(proveedoresData);
      setSegmentos(segmentosData);
    } catch (error) {
      console.error("Error al cargar datos:", error);
      setNotificacion({
        mensaje: "Error al cargar datos",
        tipo: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRucChange = async (ruc: string) => {
    setFormData((prev) => ({ ...prev, ruc }));

    // Validar RUC (debe tener 11 dígitos)
    if (ruc.length === 11 && /^\d{11}$/.test(ruc)) {
      setValidatingRuc(true);
      try {
        const rucData = await getRucData(ruc);
        if (rucData && rucData.razonSocial) {
          setFormData((prev) => ({
            ...prev,
            nombre: rucData.razonSocial,
          }));
        }
      } catch (error) {
        console.error("Error al validar RUC:", error);
        setNotificacion({
          mensaje: "Error al validar RUC. Ingrese el nombre manualmente.",
          tipo: "error",
        });
      } finally {
        setValidatingRuc(false);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "ruc") {
      handleRucChange(value);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.ruc || !formData.nombre || !formData.segmentoId) {
      setNotificacion({
        mensaje: "RUC, nombre y segmento son requeridos",
        tipo: "error",
      });
      return;
    }

    // Validar formato de RUC
    if (!/^\d{11}$/.test(formData.ruc)) {
      setNotificacion({
        mensaje: "El RUC debe tener 11 dígitos",
        tipo: "error",
      });
      return;
    }

    // Validar email si se proporciona
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setNotificacion({
        mensaje: "Ingrese un email válido",
        tipo: "error",
      });
      return;
    }

    setSubmitting(true);
    try {
      const nuevoProveedor = await addProveedor({
        ruc: formData.ruc,
        nombre: formData.nombre,
        telefono: formData.telefono || undefined,
        email: formData.email || undefined,
        detalles: formData.detalles || undefined, // Agregar esta línea
        mesesCredito: formData.mesesCredito ? parseInt(formData.mesesCredito) : undefined,
        segmentoId: formData.segmentoId,
      });

      if (nuevoProveedor) {
        setNotificacion({
          mensaje: "Proveedor agregado exitosamente",
          tipo: "success",
        });

        // Limpiar formulario
        setFormData({
          ruc: "",
          nombre: "",
          telefono: "",
          email: "",
          detalles: "", // Nuevo campo
          mesesCredito: "", // Nuevo campo
          segmentoId: 0,
        });

        // Recargar lista de proveedores
        await loadData();
      } else {
        setNotificacion({
          mensaje: "Error al agregar proveedor",
          tipo: "error",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      setNotificacion({
        mensaje: "Error al agregar proveedor",
        tipo: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSegmentoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!segmentoFormData.nombre) {
      setNotificacion({
        mensaje: "El nombre del segmento es requerido",
        tipo: "error",
      });
      return;
    }

    setSubmittingSegmento(true);
    try {
      const nuevoSegmento = await addSegmento({
        nombre: segmentoFormData.nombre,
        descripcion: segmentoFormData.descripcion || undefined,
      });

      if (nuevoSegmento) {
        setNotificacion({
          mensaje: "Segmento agregado exitosamente",
          tipo: "success",
        });

        // Limpiar formulario
        setSegmentoFormData({
          nombre: "",
          descripcion: "",
        });

        // Recargar segmentos
        const segmentosData = await getSegmentos();
        setSegmentos(segmentosData);

        // Cerrar formulario
        setShowSegmentoForm(false);
      } else {
        setNotificacion({
          mensaje: "Error al agregar segmento",
          tipo: "error",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      setNotificacion({
        mensaje: "Error al agregar segmento",
        tipo: "error",
      });
    } finally {
      setSubmittingSegmento(false);
    }
  };

  const exportToExcel = () => {
    if (proveedores.length === 0) {
      setNotificacion({
        mensaje: "No hay proveedores para exportar",
        tipo: "error",
      });
      return;
    }
  
    // Preparar los datos para exportar con mejor formato
    const dataToExport = proveedores.map((proveedor, index) => ({
      "N°": index + 1,
      "RUC": proveedor.ruc,
      "Razón Social": proveedor.nombre,
      "Segmento": proveedor.segmento?.nombre || "Sin segmento",
      "Teléfono": proveedor.telefono || "No registrado",
      "Email": proveedor.email || "No registrado",
      "Meses de Crédito": proveedor.mesesCredito ? `${proveedor.mesesCredito} meses` : "Sin crédito",
      "Fecha de Registro": new Date(proveedor.createdAt).toLocaleDateString(
        "es-PE",
        { year: 'numeric', month: 'long', day: 'numeric' }
      ),
      "Detalles": proveedor.detalles || "Sin detalles adicionales",
    }));
  
    // Crear el libro de trabajo
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
  
    // Configurar el ancho de las columnas mejorado
    const columnWidths = [
      { wch: 5 },  // N°
      { wch: 15 }, // RUC
      { wch: 35 }, // Razón Social
      { wch: 20 }, // Segmento
      { wch: 18 }, // Teléfono
      { wch: 30 }, // Email
      { wch: 18 }, // Meses de Crédito
      { wch: 20 }, // Fecha de Registro
      { wch: 25 }, // Detalles
    ];
    worksheet["!cols"] = columnWidths;
  
    // Aplicar estilos a los encabezados
    const headerRange = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
  
    // Estilo para encabezados
    for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!worksheet[cellAddress]) continue;
      
      worksheet[cellAddress].s = {
        font: {
          bold: true,
          color: { rgb: "FFFFFF" },
          sz: 12
        },
        fill: {
          fgColor: { rgb: "2563EB" } // Azul profesional
        },
        alignment: {
          horizontal: "center",
          vertical: "center"
        },
        border: {
          top: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } },
          left: { style: "thin", color: { rgb: "000000" } },
          right: { style: "thin", color: { rgb: "000000" } }
        }
      };
    }
  
    // Aplicar estilos alternados a las filas de datos
    for (let row = 1; row <= headerRange.e.r; row++) {
      for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        if (!worksheet[cellAddress]) continue;
        
        worksheet[cellAddress].s = {
          font: {
            sz: 10
          },
          fill: {
            fgColor: { rgb: row % 2 === 0 ? "F8FAFC" : "FFFFFF" } // Filas alternadas
          },
          alignment: {
            horizontal: col === 0 ? "center" : "left", // Centrar solo el número
            vertical: "center",
            wrapText: true
          },
          border: {
            top: { style: "thin", color: { rgb: "E2E8F0" } },
            bottom: { style: "thin", color: { rgb: "E2E8F0" } },
            left: { style: "thin", color: { rgb: "E2E8F0" } },
            right: { style: "thin", color: { rgb: "E2E8F0" } }
          }
        };
      }
    }
  
    // Agregar información adicional en la parte superior
    XLSX.utils.sheet_add_aoa(worksheet, [
      ["REPORTE DE PROVEEDORES"],
      [`Fecha de generación: ${new Date().toLocaleDateString('es-PE', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`],
      [`Total de proveedores: ${proveedores.length}`],
      [""] // Fila vacía
    ], { origin: "A1" });
  
    // Ajustar el rango para incluir las nuevas filas
    const newRange = XLSX.utils.encode_range({
      s: { c: 0, r: 0 },
      e: { c: 8, r: dataToExport.length + 4 }
    });
    worksheet['!ref'] = newRange;
  
    // Estilo para el título principal
    worksheet['A1'].s = {
      font: {
        bold: true,
        sz: 16,
        color: { rgb: "1F2937" }
      },
      alignment: {
        horizontal: "center"
      }
    };
  
    // Combinar celdas para el título
    worksheet['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 8 } }, // Título
      { s: { r: 1, c: 0 }, e: { r: 1, c: 8 } }, // Fecha
      { s: { r: 2, c: 0 }, e: { r: 2, c: 8 } }  // Total
    ];
  
    // Mover los datos 4 filas hacia abajo
    XLSX.utils.sheet_add_json(worksheet, dataToExport, {
      origin: "A5",
      skipHeader: false
    });
  
    XLSX.utils.book_append_sheet(workbook, worksheet, "Proveedores");
  
    // Generar el nombre del archivo con fecha y hora
    const fechaActual = new Date();
    const fechaFormateada = fechaActual.toISOString().split('T')[0];
    const horaFormateada = fechaActual.toTimeString().split(' ')[0].replace(/:/g, '-');
    const nombreArchivo = `Proveedores_${fechaFormateada}_${horaFormateada}.xlsx`;
  
    // Descargar el archivo
    XLSX.writeFile(workbook, nombreArchivo);
  
    setNotificacion({
      mensaje: `Lista de ${proveedores.length} proveedores exportada exitosamente como ${nombreArchivo}`,
      tipo: "success",
    });
  };

  return (
    <div className="space-y-6 col-span-full">
      {notificacion && (
        <Notificacion
          mensaje={notificacion.mensaje}
          tipo={notificacion.tipo === "success" ? "exito" : notificacion.tipo}
          onClose={() => setNotificacion(null)}
        />
      )}

      {/* Formulario para agregar segmento */}
      {showSegmentoForm && (
        <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
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
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800">
                Nuevo Segmento
              </h2>
            </div>
            <button
              onClick={() => setShowSegmentoForm(false)}
              className="text-gray-500 hover:text-gray-700"
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

          <form onSubmit={handleSegmentoSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={segmentoFormData.nombre}
                onChange={(e) =>
                  setSegmentoFormData((prev) => ({
                    ...prev,
                    nombre: e.target.value,
                  }))
                }
                placeholder="Ej: EPPS, FERRETERÍA, OFICINA"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900 bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Descripción
              </label>
              <input
                type="text"
                value={segmentoFormData.descripcion}
                onChange={(e) =>
                  setSegmentoFormData((prev) => ({
                    ...prev,
                    descripcion: e.target.value,
                  }))
                }
                placeholder="Descripción del segmento"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900 bg-white"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submittingSegmento}
                className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-4 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
              >
                {submittingSegmento ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                    Agregando...
                  </>
                ) : (
                  "Agregar Segmento"
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowSegmentoForm(false)}
                className="px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Formulario para agregar proveedor */}
      <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
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
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800">Nuevo Proveedor</h2>
          </div>
          <button
            onClick={() => setShowSegmentoForm(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center"
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
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Nuevo Segmento
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* RUC */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              RUC <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                name="ruc"
                value={formData.ruc}
                onChange={handleChange}
                placeholder="Ingrese el RUC de 11 dígitos"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 bg-white"
                required
                maxLength={11}
                pattern="\d{11}"
              />
              {validatingRuc && (
                <div className="absolute right-3 top-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              El RUC debe tener exactamente 11 dígitos
            </p>
          </div>

          {/* Nombre */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Razón Social <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Nombre o razón social del proveedor"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 bg-white"
              required
            />
          </div>

          {/* Teléfono y Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Teléfono
              </label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                placeholder="Número de teléfono"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="correo@ejemplo.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 bg-white"
              />
            </div>
          </div>

          {/* Selector de Segmento */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Segmento <span className="text-red-500">*</span>
            </label>
            <select
              name="segmentoId"
              value={formData.segmentoId}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  segmentoId: Number(e.target.value),
                }))
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 bg-white"
              required
            >
              <option value={0}>Seleccione un segmento</option>
              {segmentos.map((segmento) => (
                <option key={segmento.id} value={segmento.id}>
                  {segmento.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Nuevo campo de Detalles */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Detalles
            </label>
            <textarea
              name="detalles"
              value={formData.detalles}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, detalles: e.target.value }))
              }
              placeholder="Información adicional sobre el proveedor (opcional)"
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 bg-white resize-vertical"
            />
          </div>

          {/* Nuevo campo de Meses de Crédito */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Meses de Crédito
            </label>
            <input
              type="number"
              name="mesesCredito"
              value={formData.mesesCredito}
              onChange={handleChange}
              placeholder="Número de meses de crédito que ofrece (opcional)"
              min="0"
              max="60"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 bg-white"
            />
            <p className="text-xs text-gray-500 mt-1">
              Ingrese el número de meses de crédito que ofrece el proveedor
            </p>
          </div>

          {/* Verify RUC Button */}
          <div className="flex justify-end mb-4">
            <button
              type="button"
              onClick={() => handleRucChange(formData.ruc)}
              disabled={!formData.ruc || validatingRuc}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center"
            >
              {validatingRuc ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-800 mr-2"></div>
                  Verificando...
                </>
              ) : (
                <>
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
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  Verificar RUC
                </>
              )}
            </button>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Agregando...
                </>
              ) : (
                "Agregar Proveedor"
              )}
            </button>
            <button
              type="reset"
              onClick={() =>
                setFormData({
                  ruc: "",
                  nombre: "",
                  telefono: "",
                  email: "",
                  detalles: "",
                  mesesCredito: "", // Nuevo campo
                  segmentoId: 0,
                })
              }
              className="px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
            >
              Limpiar
            </button>
          </div>
        </form>
      </div>

      {/* Lista de proveedores */}
      <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800">
              Lista de Proveedores ({proveedoresFiltrados.length} de {proveedores.length})
            </h2>
          </div>
          <button
            onClick={exportToExcel}
            disabled={loading || proveedores.length === 0}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center"
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
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Exportar a Excel
          </button>
        </div>

        {/* Sección de filtros */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700 flex items-center">
              <svg
                className="w-5 h-5 mr-2 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              Filtros
            </h3>
            <button
              onClick={limpiarFiltros}
              className="text-sm text-gray-600 hover:text-gray-800 underline"
            >
              Limpiar filtros
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Búsqueda general */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={filtros.busqueda}
                  onChange={(e) =>
                    setFiltros((prev) => ({ ...prev, busqueda: e.target.value }))
                  }
                  placeholder="RUC, nombre, teléfono o email..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                <svg
                  className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
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

            {/* Filtro por segmento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Segmento
              </label>
              <select
                value={filtros.segmentoId}
                onChange={(e) =>
                  setFiltros((prev) => ({
                    ...prev,
                    segmentoId: Number(e.target.value),
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value={0}>Todos los segmentos</option>
                {segmentos.map((segmento) => (
                  <option key={segmento.id} value={segmento.id}>
                    {segmento.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por crédito */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Crédito
              </label>
              <select
                value={filtros.conCredito}
                onChange={(e) =>
                  setFiltros((prev) => ({ ...prev, conCredito: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="todos">Todos</option>
                <option value="con">Con crédito</option>
                <option value="sin">Sin crédito</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : proveedores.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-4"
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
            <p className="text-lg font-medium">No hay proveedores registrados</p>
            <p className="text-sm">Comience agregando su primer proveedor</p>
          </div>
        ) : proveedoresFiltrados.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-4"
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
            <p className="text-lg font-medium">No se encontraron proveedores</p>
            <p className="text-sm">Intente ajustar los filtros de búsqueda</p>
            <button
              onClick={limpiarFiltros}
              className="mt-3 text-blue-600 hover:text-blue-800 underline"
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    RUC
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Razón Social
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Segmento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Teléfono
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Meses Crédito
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Registro
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {proveedoresFiltrados.map((proveedor) => (
                  <tr key={proveedor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {proveedor.ruc}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {proveedor.nombre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {proveedor.segmento?.nombre || "Sin segmento"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {proveedor.telefono || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {proveedor.email || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {proveedor.mesesCredito ? `${proveedor.mesesCredito} meses` : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(proveedor.createdAt).toLocaleDateString(
                        "es-PE"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProveedoresView;
