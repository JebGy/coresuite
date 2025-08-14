import React, { useRef, useState, useEffect } from 'react';
import { Producto, Almacen } from '@/types';

interface MovementFormProps {
  productos: Producto[];
  almacenes: Almacen[];
  onSubmit: (formData: any) => Promise<void>;
  submitting: boolean;
}

interface MovementFormData {
  tipo: 'entrada' | 'salida';
  fecha: string;
  cantidad: number;
  precioUnitario: number;
  motivo: string;
  factura: string;
  productoId: number;
  almacenId: number;
}

export const MovementForm: React.FC<MovementFormProps> = ({
  productos,
  almacenes,
  onSubmit,
  submitting
}) => {
  const [formData, setFormData] = useState<MovementFormData>({
    tipo: 'entrada',
    fecha: new Date().toISOString().slice(0, 10),
    cantidad: 0,
    precioUnitario: 0,
    motivo: '',
    factura: '',
    productoId: 0,
    almacenId: 0,
  });

  const [productoInput, setProductoInput] = useState('');
  const [sugerenciasProducto, setSugerenciasProducto] = useState<Producto[]>([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const inputProductoRef = useRef<HTMLInputElement>(null);

  // Filter product suggestions
  useEffect(() => {
    if (productoInput.trim() === '') {
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productoId || !formData.cantidad || !formData.fecha || !formData.almacenId) {
      return;
    }

    await onSubmit(formData);
    
    // Reset form
    setFormData({
      ...formData,
      cantidad: 0,
      precioUnitario: 0,
      motivo: '',
      factura: formData.factura,
      productoId: 0,
      almacenId: 0,
    });
    setProductoInput('');
  };

  const handleProductSelect = (producto: Producto) => {
    setProductoInput(`${producto.nombre} (${producto.codigo})`);
    setFormData(prev => ({
      ...prev,
      productoId: producto.id,
      almacenId: producto.almacenId || 0,
    }));
    setMostrarSugerencias(false);
  };

  const getAlmacenDisplay = () => {
    const prod = productos.find(p => p.id === formData.productoId);
    if (!prod) return 'Selecciona un producto';
    const almacen = almacenes.find(a => a.id === prod.almacenId);
    return almacen ? `${almacen.nombre} (${almacen.ubicacion})` : 'Sin almacén asignado';
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200">
      <div className="flex items-center mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center mr-3">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-800">Nuevo Movimiento</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Product Input with Autocomplete */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Producto</label>
          <div className="relative">
            <input
              ref={inputProductoRef}
              type="text"
              name="productoInput"
              autoComplete="off"
              value={productoInput}
              onChange={(e) => {
                setProductoInput(e.target.value);
                setMostrarSugerencias(true);
              }}
              onFocus={() => setMostrarSugerencias(true)}
              onBlur={() => setTimeout(() => setMostrarSugerencias(false), 150)}
              placeholder="Escribe el nombre o código del producto"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 bg-white"
              required
            />
            {mostrarSugerencias && sugerenciasProducto.length > 0 && (
              <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg mt-1 max-h-48 overflow-y-auto shadow-lg">
                {sugerenciasProducto.map((p) => (
                  <li
                    key={p.id}
                    className="px-4 py-2 cursor-pointer flex flex-col hover:bg-blue-100 text-gray-800"
                    onMouseDown={() => handleProductSelect(p)}
                  >
                    <p className="font-bold">
                      {p.nombre}{' '}
                      <span className="text-xs font-normal text-gray-500">({p.codigo})</span>
                    </p>
                    <span className="text-gray-500">{p.descripcion}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Warehouse Display */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Almacén</label>
          <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-900">
            {getAlmacenDisplay()}
          </div>
        </div>

        {/* Type and Date */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo</label>
            <select
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 bg-white"
            >
              <option value="entrada">Entrada</option>
              <option value="salida">Salida</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha</label>
            <input
              type="date"
              name="fecha"
              value={formData.fecha}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 bg-white"
              required
            />
          </div>
        </div>

        {/* Quantity and Unit Price */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Cantidad</label>
            <input
              type="number"
              name="cantidad"
              value={formData.cantidad}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 bg-white"
              required
              min="1"
            />
          </div>
          {formData.tipo === 'entrada' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Precio Unitario</label>
              <input
                type="number"
                name="precioUnitario"
                value={formData.precioUnitario}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 bg-white"
                step="0.01"
                min="0"
              />
            </div>
          )}
        </div>

        {/* Reason */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Motivo</label>
          <input
            name="motivo"
            placeholder="Motivo del movimiento"
            value={formData.motivo}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 bg-white"
            required
          />
        </div>

        {/* Invoice (only for entries) */}
        {formData.tipo === 'entrada' && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Factura (opcional)</label>
            <input
              type="text"
              name="factura"
              value={formData.factura}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 bg-white"
              placeholder="Número de factura"
            />
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
        >
          {submitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Registrando...
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Registrar Movimiento
            </>
          )}
        </button>
      </form>
    </div>
  );
};