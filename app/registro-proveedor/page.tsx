"use client";
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useState, useEffect, Suspense } from "react";
import { Segmento } from "@/types";

interface ProveedorFormData {
  ruc: string;
  nombre: string;
  telefono: string;
  email: string;
  detalles: string;
  mesesCredito: string;
  segmentoId: number;
}

function RegistroProveedorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get('token');
  
  const [segmentos, setSegmentos] = useState<Segmento[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [validatingRuc, setValidatingRuc] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [preselectedSegmento, setPreselectedSegmento] = useState<number | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  const [formData, setFormData] = useState<ProveedorFormData>({
    ruc: "",
    nombre: "",
    telefono: "",
    email: "",
    detalles: "",
    mesesCredito: "",
    segmentoId: 0,
  });

  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      setLoading(false);
      return;
    }
    
    validateTokenAndLoadData();
  }, [token]);

  const validateTokenAndLoadData = async () => {
    try {
      // Validar token y obtener segmentos
      const [tokenResponse, segmentosResponse] = await Promise.all([
        fetch(`/api/proveedores/validate-token?token=${token}`),
        fetch('/api/segmentos')
      ]);

      if (tokenResponse.ok) {
        const tokenData = await tokenResponse.json();
        setTokenValid(true);
        if (tokenData.segmentoId) {
          setPreselectedSegmento(tokenData.segmentoId);
          setFormData(prev => ({ ...prev, segmentoId: tokenData.segmentoId }));
        }
      } else {
        setTokenValid(false);
      }

      if (segmentosResponse.ok) {
        const segmentosData = await segmentosResponse.json();
        setSegmentos(segmentosData);
      }
    } catch (error) {
      console.error('Error validating token:', error);
      setTokenValid(false);
    } finally {
      setLoading(false);
    }
  };

  const validateRuc = async (rucValue: string) => {
    if (rucValue.length !== 11) return;
    
    setValidatingRuc(true);
    try {
      const response = await fetch('/api/proveedores/validate-ruc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ruc: rucValue })
      });
      
      const data = await response.json();
      if (data.success && data.nombre) {
        setFormData(prev => ({ ...prev, nombre: data.nombre }));
      }
    } catch (error) {
      console.error('Error validating RUC:', error);
    } finally {
      setValidatingRuc(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!token) return;
    
    setSubmitting(true);
    try {
      const response = await fetch('/api/proveedores/register-public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, token })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setNotification({
          message: 'Registro completado exitosamente. Nos pondremos en contacto pronto.',
          type: 'success'
        });
        // Limpiar formulario
        setFormData({
          ruc: "",
          nombre: "",
          telefono: "",
          email: "",
          detalles: "",
          mesesCredito: "",
          segmentoId: preselectedSegmento || 0,
        });
      } else {
        setNotification({
          message: data.message || 'Error al procesar el registro',
          type: 'error'
        });
      }
    } catch (error) {
      setNotification({
        message: 'Error de conexión. Intente nuevamente.',
        type: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'ruc' && value.length === 11) {
      validateRuc(value);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Validando acceso...</p>
        </div>
      </div>
    );
  }

  if (tokenValid === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <h2 className="text-xl font-bold mb-2">Acceso no válido</h2>
            <p>El enlace de registro ha expirado o no es válido. Por favor, solicite un nuevo enlace de registro.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow-xl rounded-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Registro de Proveedor
            </h1>
            <p className="text-gray-600">
              Complete el formulario para registrarse como proveedor
            </p>
          </div>

          {notification && (
            <div className={`mb-6 p-4 rounded-md ${
              notification.type === 'success' 
                ? 'bg-green-100 border border-green-400 text-green-700'
                : 'bg-red-100 border border-red-400 text-red-700'
            }`}>
              {notification.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* RUC */}
            <div>
              <label htmlFor="ruc" className="block text-sm font-medium text-gray-700 mb-2">
                RUC *
              </label>
              <input
                type="text"
                id="ruc"
                name="ruc"
                value={formData.ruc}
                onChange={handleInputChange}
                maxLength={11}
                pattern="[0-9]{11}"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ingrese RUC de 11 dígitos"
              />
              {validatingRuc && (
                <p className="text-sm text-corporate-primary mt-1">Validando RUC...</p>
              )}
            </div>

            {/* Nombre */}
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
                Razón Social *
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nombre o razón social de la empresa"
              />
            </div>

            {/* Teléfono */}
            <div>
              <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono
              </label>
              <input
                type="tel"
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Número de teléfono"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Correo electrónico"
              />
            </div>

            {/* Segmento */}
            <div>
              <label htmlFor="segmentoId" className="block text-sm font-medium text-gray-700 mb-2">
                Segmento *
              </label>
              <select
                id="segmentoId"
                name="segmentoId"
                value={formData.segmentoId}
                onChange={handleInputChange}
                required
                disabled={preselectedSegmento !== null}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              >
                <option value={0}>Seleccione un segmento</option>
                {segmentos.map((segmento) => (
                  <option key={segmento.id} value={segmento.id}>
                    {segmento.nombre}
                  </option>
                ))}
              </select>
              {preselectedSegmento && (
                <p className="text-sm text-gray-600 mt-1">
                  Segmento preseleccionado para este registro
                </p>
              )}
            </div>

            {/* Meses de Crédito */}
            <div>
              <label htmlFor="mesesCredito" className="block text-sm font-medium text-gray-700 mb-2">
                Meses de Crédito
              </label>
              <input
                type="number"
                id="mesesCredito"
                name="mesesCredito"
                value={formData.mesesCredito}
                onChange={handleInputChange}
                min="0"
                max="12"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Número de meses (opcional)"
              />
            </div>

            {/* Detalles */}
            <div>
              <label htmlFor="detalles" className="block text-sm font-medium text-gray-700 mb-2">
                Detalles Adicionales
              </label>
              <textarea
                id="detalles"
                name="detalles"
                value={formData.detalles}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Información adicional sobre su empresa o servicios"
              />
            </div>

            {/* Botón de envío */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-corporate-primary text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {submitting ? 'Procesando...' : 'Registrar Proveedor'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function RegistroProveedor() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <RegistroProveedorContent />
    </Suspense>
  );
}