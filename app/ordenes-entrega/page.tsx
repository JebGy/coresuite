'use client'

import { useState, useEffect } from 'react'
import { OrdenEntrega, Trabajador, Producto, Almacen } from '@/types'
import { getOrdenesEntrega, createOrdenEntrega, aprobarOrdenEntrega, rechazarOrdenEntrega } from '@/app/actions/OrdenesEntregaActions'
import { getTrabajadores } from '@/app/actions/TrabajadoresActions'
import { getProductos } from '@/app/actions/ProductosActions'
import { getAlmacenes } from '@/app/actions/AlmacenesActions'

export default function OrdenesEntregaPage() {
  const [ordenes, setOrdenes] = useState<OrdenEntrega[]>([])
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [almacenes, setAlmacenes] = useState<Almacen[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    trabajadorId: 0,
    productoId: 0,
    almacenId: 0,
    cantidad: 1,
    motivo: '',
    observaciones: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [ordenesData, trabajadoresData, productosData, almacenesData] = await Promise.all([
        getOrdenesEntrega(),
        getTrabajadores(),
        getProductos(),
        getAlmacenes()
      ])
      setOrdenes(ordenesData)
      setTrabajadores(trabajadoresData)
      setProductos(productosData)
      setAlmacenes(almacenesData)
    } catch (error) {
      console.error('Error al cargar datos:', error)
      alert('Error al cargar los datos')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.trabajadorId || !formData.productoId || !formData.almacenId) {
      alert('Debe completar todos los campos obligatorios')
      return
    }

    if (formData.cantidad <= 0) {
      alert('La cantidad debe ser mayor a 0')
      return
    }

    try {
      await createOrdenEntrega(formData)
      alert('Orden de entrega creada correctamente')
      setShowForm(false)
      resetForm()
      loadData()
    } catch (error) {
      console.error('Error al crear orden de entrega:', error)
      alert('Error al crear la orden de entrega')
    }
  }

  const handleAprobar = async (id: number) => {
    if (!confirm('¿Está seguro de que desea aprobar esta orden de entrega?')) return
    
    try {
      await aprobarOrdenEntrega(id)
      alert('Orden de entrega aprobada correctamente')
      loadData()
    } catch (error) {
      console.error('Error al aprobar orden:', error)
      alert(error instanceof Error ? error.message : 'Error al aprobar la orden')
    }
  }

  const handleRechazar = async (id: number) => {
    const motivo = prompt('Ingrese el motivo del rechazo:')
    if (!motivo) return
    
    try {
      await rechazarOrdenEntrega(id, motivo)
      alert('Orden de entrega rechazada correctamente')
      loadData()
    } catch (error) {
      console.error('Error al rechazar orden:', error)
      alert('Error al rechazar la orden')
    }
  }

  const resetForm = () => {
    setFormData({
      trabajadorId: 0,
      productoId: 0,
      almacenId: 0,
      cantidad: 1,
      motivo: '',
      observaciones: ''
    })
  }

  const cancelForm = () => {
    setShowForm(false)
    resetForm()
  }

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800'
      case 'aprobada':
        return 'bg-green-100 text-green-800'
      case 'rechazada':
        return 'bg-red-100 text-red-800'
      case 'entregada':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Cargando...</div>
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Órdenes de Entrega</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Nueva Orden
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Nueva Orden de Entrega</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trabajador *
                </label>
                <select
                  value={formData.trabajadorId}
                  onChange={(e) => setFormData({...formData, trabajadorId: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value={0}>Seleccionar trabajador</option>
                  {trabajadores.map(trabajador => (
                    <option key={trabajador.id} value={trabajador.id}>
                      {trabajador.apellidos}, {trabajador.nombres} - {trabajador.unidad?.nombre}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Producto *
                </label>
                <select
                  value={formData.productoId}
                  onChange={(e) => setFormData({...formData, productoId: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value={0}>Seleccionar producto</option>
                  {productos.map(producto => (
                    <option key={producto.id} value={producto.id}>
                      {producto.codigo} - {producto.nombre}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Almacén *
                </label>
                <select
                  value={formData.almacenId}
                  onChange={(e) => setFormData({...formData, almacenId: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value={0}>Seleccionar almacén</option>
                  {almacenes.map(almacen => (
                    <option key={almacen.id} value={almacen.id}>
                      {almacen.nombre}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cantidad *
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.cantidad}
                  onChange={(e) => setFormData({...formData, cantidad: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Motivo *
              </label>
              <input
                type="text"
                value={formData.motivo}
                onChange={(e) => setFormData({...formData, motivo: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observaciones
              </label>
              <textarea
                value={formData.observaciones}
                onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
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
                Crear Orden
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
                Ticket
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trabajador
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Producto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cantidad
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {ordenes.map((orden) => (
              <tr key={orden.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {orden.numeroTicket}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(orden.fechaSolicitud).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {orden.trabajador?.apellidos}, {orden.trabajador?.nombres}
                  <br />
                  <span className="text-xs text-gray-500">{orden.trabajador?.unidad?.nombre}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {orden.producto?.codigo} - {orden.producto?.nombre}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {orden.cantidad}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoColor(orden.estado)}`}>
                    {orden.estado}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {orden.estado === 'pendiente' && (
                    <>
                      <button
                        onClick={() => handleAprobar(orden.id)}
                        className="text-green-600 hover:text-green-900 mr-3"
                      >
                        Aprobar
                      </button>
                      <button
                        onClick={() => handleRechazar(orden.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Rechazar
                      </button>
                    </>
                  )}
                  {orden.estado === 'aprobada' && (
                    <span className="text-green-600">Aprobada</span>
                  )}
                  {orden.estado === 'rechazada' && (
                    <span className="text-red-600">Rechazada</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
} 