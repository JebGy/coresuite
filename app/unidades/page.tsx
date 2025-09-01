'use client'

import { useState, useEffect } from 'react'
import { Unidad } from '@/types'
import { getUnidades, createUnidad, updateUnidad, deleteUnidad } from '@/app/actions/UnidadesActions'
import { useUser } from '@/app/context/UserContext'
import { Notificacion } from "../components/Notificacion";

export default function UnidadesPage() {
  const [unidades, setUnidades] = useState<Unidad[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingUnidad, setEditingUnidad] = useState<Unidad | null>(null)
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: ''
  })
  const [notificacion, setNotificacion] = useState<{
    mensaje: string;
    tipo?: 'exito' | 'error' | 'info';
  } | null>(null);

  const user = useUser();

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const unidadesData = await getUnidades()
      setUnidades(unidadesData)
    } catch (error) {
      console.error('Error al cargar unidades:', error)
      setNotificacion({ mensaje: 'Error al cargar las unidades', tipo: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.nombre.trim()) {
      setNotificacion({ mensaje: 'El nombre de la unidad es obligatorio', tipo: 'error' })
      return
    }

    try {
      if (editingUnidad) {
        await updateUnidad(editingUnidad.id, formData, user.id)
        setNotificacion({ mensaje: 'Unidad actualizada correctamente', tipo: 'exito' })
      } else {
        await createUnidad(formData, user.id)
        setNotificacion({ mensaje: 'Unidad creada correctamente', tipo: 'exito' })
      }
      
      setShowForm(false)
      setEditingUnidad(null)
      resetForm()
      loadData()
    } catch (error) {
      console.error('Error al guardar unidad:', error)
      setNotificacion({ mensaje: 'Error al guardar la unidad', tipo: 'error' })
    }
  }

  const handleEdit = (unidad: Unidad) => {
    setEditingUnidad(unidad)
    setFormData({
      nombre: unidad.nombre,
      descripcion: unidad.descripcion || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Está seguro de que desea eliminar esta unidad?')) return
    
    try {
      await deleteUnidad(id,user.id)
      setNotificacion({ mensaje: 'Unidad eliminada correctamente', tipo: 'exito' })
      loadData()
    } catch (error) {
      console.error('Error al eliminar unidad:', error)
      setNotificacion({ mensaje: 'Error al eliminar la unidad', tipo: 'error' })
    }
  }

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: ''
    })
  }

  const cancelForm = () => {
    setShowForm(false)
    setEditingUnidad(null)
    resetForm()
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Cargando...</div>
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Unidades</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Nueva Unidad
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingUnidad ? 'Editar Unidad' : 'Nueva Unidad'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre *
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={cancelForm}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {editingUnidad ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Descripción
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {unidades.map((unidad) => (
              <tr key={unidad.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {unidad.nombre}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {unidad.descripcion || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEdit(unidad)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(unidad.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {notificacion && (
        <Notificacion
          mensaje={notificacion.mensaje}
          tipo={notificacion.tipo}
          onClose={() => setNotificacion(null)}
        />
      )}
    </div>
  )
} 