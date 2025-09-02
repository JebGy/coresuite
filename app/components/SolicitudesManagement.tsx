"use client";
import React, { useState, useEffect } from 'react';
import { Solicitud } from '../../types';
import { Notificacion } from './Notificacion';

interface SolicitudesManagementProps {
  userRole: string;
}

export function SolicitudesManagement({ userRole }: SolicitudesManagementProps) {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState<number | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<'TODAS' | 'PENDIENTE' | 'APROBADO' | 'RECHAZADO'>('PENDIENTE');
  const [notificacion, setNotificacion] = useState<{
    mensaje: string;
    tipo?: 'exito' | 'error' | 'info';
  } | null>(null);
  const [motivoRechazo, setMotivoRechazo] = useState('');
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState<number | null>(null);
  const [mostrarModalRechazo, setMostrarModalRechazo] = useState(false);

 

  // Cargar solicitudes
  useEffect(() => {
    cargarSolicitudes();
  }, [filtroEstado]);

  const cargarSolicitudes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/solicitudes');
      if (response.ok) {
        const data = await response.json();
        let solicitudesFiltradas = data.solicitudes;
        
        if (filtroEstado !== 'TODAS') {
          solicitudesFiltradas = data.solicitudes.filter(
            (s: Solicitud) => s.estado === filtroEstado
          );
        }
        
        setSolicitudes(solicitudesFiltradas);
      } else {
        setNotificacion({
          mensaje: 'Error al cargar las solicitudes',
          tipo: 'error'
        });
      }
    } catch (error) {
      setNotificacion({
        mensaje: 'Error de conexión al cargar solicitudes',
        tipo: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const aprobarSolicitud = async (solicitudId: number) => {
    try {
      setProcesando(solicitudId);
      const response = await fetch(`/api/solicitudes/${solicitudId}/aprobar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setNotificacion({
          mensaje: 'Solicitud aprobada exitosamente',
          tipo: 'exito'
        });
        cargarSolicitudes();
      } else {
        const errorData = await response.json();
        setNotificacion({
          mensaje: errorData.error || 'Error al aprobar la solicitud',
          tipo: 'error'
        });
      }
    } catch (error) {
      setNotificacion({
        mensaje: 'Error de conexión al aprobar solicitud',
        tipo: 'error'
      });
    } finally {
      setProcesando(null);
    }
  };

  const rechazarSolicitud = async () => {
    if (!solicitudSeleccionada || !motivoRechazo.trim()) {
      setNotificacion({
        mensaje: 'Debe proporcionar un motivo de rechazo',
        tipo: 'error'
      });
      return;
    }

    try {
      setProcesando(solicitudSeleccionada);
      const response = await fetch(`/api/solicitudes/${solicitudSeleccionada}/rechazar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ motivo: motivoRechazo }),
      });

      if (response.ok) {
        setNotificacion({
          mensaje: 'Solicitud rechazada exitosamente',
          tipo: 'exito'
        });
        cargarSolicitudes();
        cerrarModalRechazo();
      } else {
        const errorData = await response.json();
        setNotificacion({
          mensaje: errorData.error || 'Error al rechazar la solicitud',
          tipo: 'error'
        });
      }
    } catch (error) {
      setNotificacion({
        mensaje: 'Error de conexión al rechazar solicitud',
        tipo: 'error'
      });
    } finally {
      setProcesando(null);
    }
  };

  const abrirModalRechazo = (solicitudId: number) => {
    setSolicitudSeleccionada(solicitudId);
    setMostrarModalRechazo(true);
  };

  const cerrarModalRechazo = () => {
    setMostrarModalRechazo(false);
    setSolicitudSeleccionada(null);
    setMotivoRechazo('');
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'PENDIENTE':
        return 'bg-yellow-100 text-yellow-800';
      case 'APROBADO':
        return 'bg-green-100 text-green-800';
      case 'RECHAZADO':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  return (
    <div className="space-y-6 col-span-full">
      {/* Filtros */}
      <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200">
        <div className="flex flex-wrap gap-4 items-center">
          <h3 className="text-lg font-semibold text-gray-800">Filtrar por estado:</h3>
          <div className="flex gap-2">
            {(['TODAS', 'PENDIENTE', 'APROBADO', 'RECHAZADO'] as const).map((estado) => (
              <button
                key={estado}
                onClick={() => setFiltroEstado(estado)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filtroEstado === estado
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {estado === 'TODAS' ? 'Todas' : estado.charAt(0) + estado.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Lista de solicitudes */}
      <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Solicitudes {filtroEstado !== 'TODAS' ? filtroEstado.toLowerCase() : ''}</h2>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Cargando solicitudes...</p>
          </div>
        ) : solicitudes.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="mt-2">No hay solicitudes {filtroEstado !== 'TODAS' ? filtroEstado.toLowerCase() : ''}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {solicitudes.map((solicitud) => (
              <div key={solicitud.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Solicitud #{solicitud.id}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(solicitud.estado)}`}>
                        {solicitud.estado}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Solicitante:</span> {solicitud.usuario?.nombres} {solicitud.usuario?.apellidos}
                      </div>
                      <div>
                        <span className="font-medium">Email:</span> {solicitud.usuario?.email || 'N/A'}
                      </div>
                      <div>
                        <span className="font-medium">Fecha:</span> {new Date(solicitud.createdAt).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-medium">Unidad:</span> N/A
                      </div>
                    </div>
                    
                    {solicitud.asunto && (
                      <div className="mt-3">
                        <span className="font-medium text-gray-700">Asunto:</span>
                        <p className="text-gray-600 mt-1">{solicitud.asunto}</p>
                      </div>
                    )}
                    
                    {solicitud.elementos && solicitud.elementos.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium text-gray-700 mb-2">Elementos solicitados:</h4>
                        <div className="bg-gray-50 rounded-lg p-3">
                          {solicitud.elementos.map((elemento, index) => (
                            <div key={index} className="flex justify-between items-center py-1">
                              <span className="text-gray-700">{elemento.nombre || 'Producto no encontrado'}</span>
                              <span className="text-gray-600">Cantidad: {elemento.cantidad}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {solicitud.estado === 'PENDIENTE' && (
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => aprobarSolicitud(solicitud.id)}
                        disabled={procesando === solicitud.id}
                        className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                      >
                        {procesando === solicitud.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        Aprobar
                      </button>
                      
                      <button
                        onClick={() => abrirModalRechazo(solicitud.id)}
                        disabled={procesando === solicitud.id}
                        className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Rechazar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de rechazo */}
      {mostrarModalRechazo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Rechazar Solicitud</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motivo del rechazo:
              </label>
              <textarea
                value={motivoRechazo}
                onChange={(e) => setMotivoRechazo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                rows={4}
                placeholder="Explique el motivo del rechazo..."
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cerrarModalRechazo}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={rechazarSolicitud}
                disabled={!motivoRechazo.trim() || procesando === solicitudSeleccionada}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                {procesando === solicitudSeleccionada ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : null}
                Rechazar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notificaciones */}
      {notificacion && (
        <Notificacion
          mensaje={notificacion.mensaje}
          tipo={notificacion.tipo}
          onClose={() => setNotificacion(null)}
        />
      )}
    </div>
  );
}