'use client'

import { useState, useEffect } from 'react'
import { Trabajador, Unidad, Rol } from '@/types'
import { getTrabajadores, createTrabajador, updateTrabajador, deleteTrabajador, getRoles } from '@/app/actions/TrabajadoresActions'
import { getUnidades } from '@/app/actions/UnidadesActions'

export default function TrabajadoresPage() {
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([])
  const [unidades, setUnidades] = useState<Unidad[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingTrabajador, setEditingTrabajador] = useState<Trabajador | null>(null)
  const [formData, setFormData] = useState({
    dni: '',
    nombres: '',
    apellidos: '',
    email: '',
    telefono: '',
    unidadId: 0
  })
  const [roles, setRoles] = useState<Rol[]>([])
  const [selectedRolId, setSelectedRolId] = useState<number | null>(null)

  useEffect(() => {
    loadData()
    loadRoles()
  }, [])

  const loadData = async () => {
    try {
      const [trabajadoresData, unidadesData] = await Promise.all([
        getTrabajadores(),
        getUnidades()
      ])
      setTrabajadores(trabajadoresData)
      setUnidades(unidadesData)
    } catch (error) {
      console.error('Error al cargar datos:', error)
      alert('Error al cargar los datos')
    } finally {
      setLoading(false)
    }
  }

  const loadRoles = async () => {
    try {
      const rolesData = await getRoles()
      setRoles(rolesData)
    } catch (error) {
      alert('Error al cargar los roles')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.unidadId) {
      alert('Debe seleccionar una unidad')
      return
    }
    if (!selectedRolId) {
      alert('Debe seleccionar un rol')
      return
    }

    try {
      if (editingTrabajador) {
        await updateTrabajador(editingTrabajador.id, { ...formData, rolId: selectedRolId })
        alert('Trabajador actualizado correctamente')
      } else {
        await createTrabajador({ ...formData, rolId: selectedRolId })
        alert('Trabajador creado correctamente')
      }
      
      setShowForm(false)
      setEditingTrabajador(null)
      resetForm()
      setSelectedRolId(null)
      loadData()
    } catch (error) {
      console.error('Error al guardar trabajador:', error)
      alert('Error al guardar el trabajador')
    }
  }

  const handleEdit = (trabajador: Trabajador) => {
    setEditingTrabajador(trabajador)
    setFormData({
      dni: trabajador.dni,
      nombres: trabajador.nombres,
      apellidos: trabajador.apellidos,
      email: trabajador.email,
      telefono: trabajador.telefono,
      unidadId: trabajador.unidadId
    })
    setSelectedRolId((trabajador as any).rolId || null)
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Está seguro de que desea eliminar este trabajador?')) return
    
    try {
      await deleteTrabajador(id)
      alert('Trabajador eliminado correctamente')
      loadData()
    } catch (error) {
      console.error('Error al eliminar trabajador:', error)
      alert('Error al eliminar el trabajador')
    }
  }

  const resetForm = () => {
    setFormData({
      dni: '',
      nombres: '',
      apellidos: '',
      email: '',
      telefono: '',
      unidadId: 0
    })
    setSelectedRolId(null)
  }

  const cancelForm = () => {
    setShowForm(false)
    setEditingTrabajador(null)
    resetForm()
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Cargando...</div>
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Trabajadores</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Nuevo Trabajador
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingTrabajador ? 'Editar Trabajador' : 'Nuevo Trabajador'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  DNI *
                </label>
                <input
                  type="text"
                  value={formData.dni}
                  onChange={(e) => setFormData({...formData, dni: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombres *
                </label>
                <input
                  type="text"
                  value={formData.nombres}
                  onChange={(e) => setFormData({...formData, nombres: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Apellidos *
                </label>
                <input
                  type="text"
                  value={formData.apellidos}
                  onChange={(e) => setFormData({...formData, apellidos: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono *
                </label>
                <input
                  type="text"
                  value={formData.telefono}
                  onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unidad *
                </label>
                <select
                  value={formData.unidadId}
                  onChange={(e) => setFormData({...formData, unidadId: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value={0}>Seleccionar unidad</option>
                  {unidades.map(unidad => (
                    <option key={unidad.id} value={unidad.id}>
                      {unidad.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rol *
                </label>
                <select
                  value={selectedRolId || ''}
                  onChange={e => setSelectedRolId(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Seleccione un rol</option>
                  {roles.map(rol => (
                    <option key={rol.id} value={rol.id}>{rol.nombre}</option>
                  ))}
                </select>
              </div>
            </div>
            {/* Mostrar permisos del rol seleccionado */}
            {selectedRolId && (
              <div className="bg-gray-50 p-4 rounded mb-2">
                <strong>Permisos del rol seleccionado:</strong>
                <pre className="text-xs mt-2 bg-white p-2 rounded overflow-x-auto">
                  {JSON.stringify(roles.find(r => r.id === selectedRolId)?.permisos, null, 2)}
                </pre>
              </div>
            )}
            <div className="flex gap-4 mt-4">
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                {editingTrabajador ? 'Actualizar' : 'Crear'}
              </button>
              <button type="button" onClick={cancelForm} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded">
                Cancelar
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
                DNI
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombres
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Apellidos
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Teléfono
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Unidad
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {trabajadores.map((trabajador) => (
              <tr key={trabajador.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {trabajador.dni}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {trabajador.nombres}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {trabajador.apellidos}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {trabajador.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {trabajador.telefono}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {trabajador.unidad?.nombre}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEdit(trabajador)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(trabajador.id)}
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
    </div>
  )
} 