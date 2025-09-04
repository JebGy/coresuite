"use client";

import { useState, useEffect } from "react";
import { useUser } from "../context/UserContext";
import { Notificacion } from "../components/Notificacion";
import { useRouter } from "next/navigation";

interface Solicitud {
  id: number;
  usuarioId: number;
  asunto: string;
  elementos: { nombre: string; cantidad: number }[];
  estado: "PENDIENTE" | "APROBADO" | "RECHAZADO";
  motivo?: string;
  createdAt: string;
  updatedAt: string;
  usuario: {
    nombres: string;
    apellidos: string;
    email: string;
  };
}

interface ElementoSolicitud {
  nombre: string;
  cantidad: number;
}

export default function SolicitudesPage() {
  const { id: userId, rol } = useUser();
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [asunto, setAsunto] = useState("");
  const [elementos, setElementos] = useState<ElementoSolicitud[]>([{ nombre: "", cantidad: 1 }]);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"crear" | "listar" | "aprobar">("crear");

  // Verificar si el usuario tiene permisos de aprobación
  const canApprove = rol === "RESIDENTE_OBRA" || rol === "GERENTE_OBRA" || rol === "ADMIN";

  useEffect(() => {
    if (activeTab === "listar" || activeTab === "aprobar") {
      loadSolicitudes();
    }
  }, [activeTab]);

  const loadSolicitudes = async () => {
    try {
      const response = await fetch("/api/solicitudes");
      if (response.ok) {
        const data = await response.json();
        setSolicitudes(data.solicitudes);
      }
    } catch (error) {
      console.error("Error al cargar solicitudes:", error);
    }
  };

  const addElemento = () => {
    setElementos([...elementos, { nombre: "", cantidad: 1 }]);
  };

  const removeElemento = (index: number) => {
    if (elementos.length > 1) {
      setElementos(elementos.filter((_, i) => i !== index));
    }
  };

  const updateElemento = (index: number, field: keyof ElementoSolicitud, value: string | number) => {
    const newElementos = [...elementos];
    newElementos[index] = { ...newElementos[index], [field]: value };
    setElementos(newElementos);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/solicitudes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          usuarioId: userId,
          asunto,
          elementos: elementos.filter(el => el.nombre.trim() !== ""),
        }),
      });

      if (response.ok) {
        setNotification({
          show: true,
          message: "Solicitud creada exitosamente",
          type: "success",
        });
        // Limpiar formulario
        setAsunto("");
        setElementos([{ nombre: "", cantidad: 1 }]);
        setShowForm(false);
      } else {
        const error = await response.json();
        setNotification({
          show: true,
          message: error.message || "Error al crear solicitud",
          type: "error",
        });
      }
    } catch (error) {
      setNotification({
        show: true,
        message: "Error de conexión",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (solicitudId: number, estado: "APROBADO" | "RECHAZADO", motivo?: string) => {
    try {
      const response = await fetch(`/api/solicitudes/${solicitudId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ estado, motivo }),
      });

      if (response.ok) {
        setNotification({
          show: true,
          message: `Solicitud ${estado.toLowerCase()} exitosamente`,
          type: "success",
        });
        loadSolicitudes();
      } else {
        const error = await response.json();
        setNotification({
          show: true,
          message: error.message || "Error al actualizar solicitud",
          type: "error",
        });
      }
    } catch (error) {
      setNotification({
        show: true,
        message: "Error de conexión",
        type: "error",
      });
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "PENDIENTE":
        return "bg-yellow-100 text-yellow-800";
      case "APROBADO":
        return "bg-green-100 text-green-800";
      case "RECHAZADO":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab("crear")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "crear"
                    ? "border-blue-500 text-corporate-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Nueva Solicitud
              </button>
              <button
                onClick={() => setActiveTab("listar")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "listar"
                    ? "border-blue-500 text-corporate-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Mis Solicitudes
              </button>
              {canApprove && (
                <button
                  onClick={() => setActiveTab("aprobar")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "aprobar"
                      ? "border-blue-500 text-corporate-primary"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Aprobar Solicitudes
                </button>
              )}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === "crear" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      Nueva Solicitud de Material/Equipo
                    </h1>
                    <p className="mt-2 text-gray-600">
                      Gestiona las solicitudes de material y equipo de la empresa
                    </p>
                  </div>
                  
                  {/* Botón de gestión para roles autorizados */}
                   {canApprove && (
                     <button
                       onClick={() => router.push('/solicitudes/gestionar')}
                       className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
                     >
                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                       </svg>
                       <span>Gestionar Solicitudes</span>
                     </button>
                   )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Asunto de la Solicitud
                    </label>
                    <input
                      type="text"
                      value={asunto}
                      onChange={(e) => setAsunto(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Describe brevemente el motivo de la solicitud"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Elementos a Solicitar
                    </label>
                    <div className="space-y-3">
                      {elementos.map((elemento, index) => (
                        <div key={index} className="flex gap-3 items-center">
                          <input
                            type="text"
                            value={elemento.nombre}
                            onChange={(e) => updateElemento(index, "nombre", e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Nombre del material/equipo"
                            required
                          />
                          <input
                            type="number"
                            value={elemento.cantidad}
                            onChange={(e) => updateElemento(index, "cantidad", parseInt(e.target.value) || 1)}
                            className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="1"
                            required
                          />
                          {elementos.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeElemento(index)}
                              className="px-3 py-2 text-red-600 hover:text-red-800"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={addElemento}
                      className="mt-3 px-4 py-2 text-sm text-corporate-primary hover:text-blue-800"
                    >
                      + Agregar elemento
                    </button>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2 bg-corporate-primary text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {loading ? "Enviando..." : "Enviar Solicitud"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === "listar" && (
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Mis Solicitudes</h1>
                <div className="space-y-4">
                  {solicitudes
                    .filter(s => s.usuarioId === userId)
                    .map((solicitud) => (
                    <div key={solicitud.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold text-lg">{solicitud.asunto}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(solicitud.estado)}`}>
                          {solicitud.estado}
                        </span>
                      </div>
                      <div className="mb-3">
                        <h4 className="font-medium text-sm text-gray-700 mb-2">Elementos solicitados:</h4>
                        <ul className="list-disc list-inside text-sm text-gray-600">
                          {solicitud.elementos.map((elemento, index) => (
                            <li key={index}>
                              {elemento.nombre} - Cantidad: {elemento.cantidad}
                            </li>
                          ))}
                        </ul>
                      </div>
                      {solicitud.motivo && (
                        <div className="mb-3">
                          <span className="font-medium text-sm text-red-700">Motivo de rechazo:</span>
                          <p className="text-sm text-red-600">{solicitud.motivo}</p>
                        </div>
                      )}
                      <p className="text-xs text-gray-500">
                        Creado: {new Date(solicitud.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "aprobar" && canApprove && (
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Aprobar Solicitudes</h1>
                <div className="space-y-4">
                  {solicitudes
                    .filter(s => s.estado === "PENDIENTE")
                    .map((solicitud) => (
                    <div key={solicitud.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">{solicitud.asunto}</h3>
                          <p className="text-sm text-gray-600">
                            Solicitado por: {solicitud.usuario.nombres} {solicitud.usuario.apellidos}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(solicitud.estado)}`}>
                          {solicitud.estado}
                        </span>
                      </div>
                      <div className="mb-4">
                        <h4 className="font-medium text-sm text-gray-700 mb-2">Elementos solicitados:</h4>
                        <ul className="list-disc list-inside text-sm text-gray-600">
                          {solicitud.elementos.map((elemento, index) => (
                            <li key={index}>
                              {elemento.nombre} - Cantidad: {elemento.cantidad}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleApproval(solicitud.id, "APROBADO")}
                          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                        >
                          Aprobar
                        </button>
                        <button
                          onClick={() => {
                            const motivo = prompt("Ingrese el motivo del rechazo:");
                            if (motivo) {
                              handleApproval(solicitud.id, "RECHAZADO", motivo);
                            }
                          }}
                          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                        >
                          Rechazar
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-3">
                        Creado: {new Date(solicitud.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {notification.show && (
        <Notificacion
          mensaje={notification.message}
          tipo={notification.type === "success" ? "exito" : notification.type as "error" | "info"}
          onClose={() => setNotification({ show: false, message: "", type: "" })}
        />
      )}
    </div>
  );
}