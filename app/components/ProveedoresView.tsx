import React, { useState, useEffect } from 'react';
import { Proveedor } from '@/types';
import { getProveedores, addProveedor, getRucData } from '@/app/actions/ProveedoresActions';
import { Notificacion } from './Notificacion';

interface ProveedorFormData {
  ruc: string;
  nombre: string;
  telefono: string;
  email: string;
}

function ProveedoresView() {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [validatingRuc, setValidatingRuc] = useState(false);
  const [notificacion, setNotificacion] = useState<{
    mensaje: string;
    tipo: 'success' | 'error';
  } | null>(null);
  
  const [formData, setFormData] = useState<ProveedorFormData>({
    ruc: '',
    nombre: '',
    telefono: '',
    email: '',
  });

  // Cargar proveedores al montar el componente
  useEffect(() => {
    loadProveedores();
  }, []);

  const loadProveedores = async () => {
    try {
      const data = await getProveedores();
      setProveedores(data);
    } catch (error) {
      console.error('Error al cargar proveedores:', error);
      setNotificacion({
        mensaje: 'Error al cargar proveedores',
        tipo: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRucChange = async (ruc: string) => {
    setFormData(prev => ({ ...prev, ruc }));
    
    // Validar RUC (debe tener 11 dígitos)
    if (ruc.length === 11 && /^\d{11}$/.test(ruc)) {
      setValidatingRuc(true);
      try {
        const rucData = await getRucData(ruc);
        if (rucData && rucData.razonSocial) {
          setFormData(prev => ({
            ...prev,
            nombre: rucData.razonSocial
          }));
        }
      } catch (error) {
        console.error('Error al validar RUC:', error);
        setNotificacion({
          mensaje: 'Error al validar RUC. Ingrese el nombre manualmente.',
          tipo: 'error'
        });
      } finally {
        setValidatingRuc(false);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'ruc') {
      handleRucChange(value);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.ruc || !formData.nombre) {
      setNotificacion({
        mensaje: 'RUC y nombre son requeridos',
        tipo: 'error'
      });
      return;
    }

    // Validar formato de RUC
    if (!/^\d{11}$/.test(formData.ruc)) {
      setNotificacion({
        mensaje: 'El RUC debe tener 11 dígitos',
        tipo: 'error'
      });
      return;
    }

    // Validar email si se proporciona
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setNotificacion({
        mensaje: 'Ingrese un email válido',
        tipo: 'error'
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
      });

      if (nuevoProveedor) {
        setNotificacion({
          mensaje: 'Proveedor agregado exitosamente',
          tipo: 'success'
        });
        
        // Limpiar formulario
        setFormData({
          ruc: '',
          nombre: '',
          telefono: '',
          email: '',
        });
        
        // Recargar lista de proveedores
        await loadProveedores();
      } else {
        setNotificacion({
          mensaje: 'Error al agregar proveedor',
          tipo: 'error'
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setNotificacion({
        mensaje: 'Error al agregar proveedor',
        tipo: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 col-span-full">
      {notificacion && (
        <Notificacion
          mensaje={notificacion.mensaje}
          tipo={notificacion.tipo === 'success' ? 'exito' : notificacion.tipo}
          onClose={() => setNotificacion(null)}
        />
      )}
      
      {/* Formulario para agregar proveedor */}
      <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800">Nuevo Proveedor</h2>
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
            <p className="text-xs text-gray-500 mt-1">El RUC debe tener exactamente 11 dígitos</p>
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">Teléfono</label>
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
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

          {/* Botón de envío */}
          <button
            type="submit"
            disabled={submitting || validatingRuc}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Agregando...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Agregar Proveedor
              </>
            )}
          </button>
        </form>
      </div>

      {/* Lista de proveedores */}
      <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center mr-3">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800">Lista de Proveedores</h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : proveedores.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No hay proveedores registrados</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RUC</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Razón Social</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Registro</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {proveedores.map((proveedor) => (
                  <tr key={proveedor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {proveedor.ruc}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {proveedor.nombre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {proveedor.telefono || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {proveedor.email || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(proveedor.createdAt).toLocaleDateString('es-PE')}
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