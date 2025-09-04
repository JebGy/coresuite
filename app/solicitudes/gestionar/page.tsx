"use client";
import React, { useState, useEffect } from 'react';
import { useUser } from '../../context/UserContext';
import { useRouter } from 'next/navigation';
import { Notificacion } from '../../components/Notificacion';
import { Solicitud } from '../../../types';

export default function GestionarSolicitudes() {
  const user = useUser();
  const router = useRouter();
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

  // Verificar permisos
  useEffect(() => {
    if (!user) return;
    
    const tienePermisos = user.rol === 'RESIDENTE_OBRA' || 
                         user.rol === 'GERENTE_OBRA' || 
                         user.rol === 'ADMIN';
    
    if (!tienePermisos) {
      router.push('/solicitudes');
      return;
    }
  }, [user, router]);

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
      }
    } catch (error) {
      console.error('Error al cargar solicitudes:', error);
      setNotificacion({
        mensaje: 'Error al cargar las solicitudes',
        tipo: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const aprobarSolicitud = async (solicitudId: number) => {
    try {
      setProcesando(solicitudId);
      const response = await fetch(`/api/solicitudes/${solicitudId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          estado: 'APROBADO'
        }),
      });

      if (response.ok) {
        setNotificacion({
          mensaje: 'Solicitud aprobada exitosamente',
          tipo: 'exito'
        });
        cargarSolicitudes();
      } else {
        throw new Error('Error al aprobar solicitud');
      }
    } catch (error) {
      console.error('Error:', error);
      setNotificacion({
        mensaje: 'Error al aprobar la solicitud',
        tipo: 'error'
      });
    } finally {
      setProcesando(null);
    }
  };

  const rechazarSolicitud = async () => {
    if (!solicitudSeleccionada || !motivoRechazo.trim()) {
      setNotificacion({
        mensaje: 'Debe proporcionar un motivo para el rechazo',
        tipo: 'error'
      });
      return;
    }

    try {
      setProcesando(solicitudSeleccionada);
      const response = await fetch(`/api/solicitudes/${solicitudSeleccionada}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          estado: 'RECHAZADO',
          motivo: motivoRechazo
        }),
      });

      if (response.ok) {
        setNotificacion({
          mensaje: 'Solicitud rechazada exitosamente',
          tipo: 'exito'
        });
        cargarSolicitudes();
        cerrarModalRechazo();
      } else {
        throw new Error('Error al rechazar solicitud');
      }
    } catch (error) {
      console.error('Error:', error);
      setNotificacion({
        mensaje: 'Error al rechazar la solicitud',
        tipo: 'error'
      });
    } finally {
      setProcesando(null);
    }
  };

  const abrirModalRechazo = (solicitudId: number) => {
    setSolicitudSeleccionada(solicitudId);
    setMotivoRechazo('');
    setMostrarModalRechazo(true);
  };

  const cerrarModalRechazo = () => {
    setSolicitudSeleccionada(null);
    setMotivoRechazo('');
    setMostrarModalRechazo(false);
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

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Gestión de Solicitudes
              </h1>
              <p className="mt-2 text-gray-600">
                Aprobar o rechazar solicitudes de material y equipo
              </p>
            </div>
            <button
              onClick={() => router.push('/solicitudes')}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Volver a Solicitudes
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="mb-6">
          <div className="flex space-x-4">
            {(['TODAS', 'PENDIENTE', 'APROBADO', 'RECHAZADO'] as const).map((estado) => (
              <button
                key={estado}
                onClick={() => setFiltroEstado(estado)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filtroEstado === estado
                    ? 'bg-corporate-primary text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                {estado === 'TODAS' ? 'Todas' : estado.charAt(0) + estado.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Solicitudes */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Cargando solicitudes...</span>
          </div>
        ) : solicitudes.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay solicitudes {filtroEstado !== 'TODAS' ? filtroEstado.toLowerCase() + 's' : ''}
            </h3>
            <p className="text-gray-600">
              {filtroEstado === 'PENDIENTE' 
                ? 'No hay solicitudes pendientes de aprobación'
                : 'No se encontraron solicitudes con el filtro seleccionado'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {solicitudes.map((solicitud) => (
              <div key={solicitud.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {solicitud.asunto}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(solicitud.estado)}`}>
                        {solicitud.estado}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Solicitante:</span> {solicitud.usuario?.nombres} {solicitud.usuario?.apellidos}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Fecha:</span> {new Date(solicitud.createdAt).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Email:</span> {solicitud.usuario?.email}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Unidad:</span> N/A
                        </p>
                      </div>
                    </div>

                    {/* Elementos solicitados */}
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Elementos solicitados:</h4>
                      <div className="bg-gray-50 rounded-lg p-3">
                        {(solicitud.elementos as { nombre: string; cantidad: number }[]).map((elemento, index) => (
                          <div key={index} className="flex justify-between items-center py-1">
                            <span className="text-sm text-gray-700">{elemento.nombre}</span>
                            <span className="text-sm font-medium text-gray-900">Cantidad: {elemento.cantidad}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Motivo de rechazo si existe */}
                    {solicitud.estado === 'RECHAZADO' && solicitud.motivo && (
                      <div className="mb-4">
                        <h4 className="font-medium text-red-900 mb-2">Motivo del rechazo:</h4>
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <p className="text-sm text-red-700">{solicitud.motivo}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Acciones */}
                  {solicitud.estado === 'PENDIENTE' && (
                    <div className="flex space-x-3 ml-6">
                      <button
                        onClick={() => aprobarSolicitud(solicitud.id)}
                        disabled={procesando === solicitud.id}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                      >
                        {procesando === solicitud.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        <span>Aprobar</span>
                      </button>
                      
                      <button
                        onClick={() => abrirModalRechazo(solicitud.id)}
                        disabled={procesando === solicitud.id}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span>Rechazar</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal de Rechazo */}
        {mostrarModalRechazo && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Rechazar Solicitud
              </h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motivo del rechazo *
                </label>
                <textarea
                  value={motivoRechazo}
                  onChange={(e) => setMotivoRechazo(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Explique el motivo por el cual se rechaza esta solicitud..."
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={cerrarModalRechazo}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={rechazarSolicitud}
                  disabled={!motivoRechazo.trim() || procesando === solicitudSeleccionada}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {procesando === solicitudSeleccionada ? 'Procesando...' : 'Rechazar'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notificación */}
        {notificacion && (
          <Notificacion
            mensaje={notificacion.mensaje}
            tipo={notificacion.tipo}
            onClose={() => setNotificacion(null)}
          />
        )}
      </div>
    </div>
  );
}