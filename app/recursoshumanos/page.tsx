"use client";
import React, { useState } from "react";

// Datos simulados de empleados
const empleadosIniciales = [
  {
    id: 1,
    nombre: "Juan Pérez",
    documento: "12345678",
    cargo: "Analista de RRHH",
    departamento: "Recursos Humanos",
    fechaIngreso: "2022-01-15",
    estado: "Activo",
    email: "juan.perez@empresa.com",
    telefono: "987654321",
  },
  {
    id: 2,
    nombre: "María López",
    documento: "87654321",
    cargo: "Jefa de Personal",
    departamento: "Recursos Humanos",
    fechaIngreso: "2021-06-10",
    estado: "Activo",
    email: "maria.lopez@empresa.com",
    telefono: "912345678",
  },
  {
    id: 3,
    nombre: "Carlos Ruiz",
    documento: "11223344",
    cargo: "Asistente",
    departamento: "Logística",
    fechaIngreso: "2023-03-20",
    estado: "Inactivo",
    email: "carlos.ruiz@empresa.com",
    telefono: "998877665",
  },
];

const departamentos = ["Recursos Humanos", "Logística", "Finanzas", "Operaciones"];
const estados = ["Activo", "Inactivo"];

// Tipos para empleado y props
interface Empleado {
  id: number;
  nombre: string;
  documento: string;
  cargo: string;
  departamento: string;
  fechaIngreso: string;
  estado: string;
  email: string;
  telefono: string;
}

interface ModalEmpleadoProps {
  empleado: Empleado | null;
  onClose: () => void;
  onSave: (emp: Omit<Empleado, 'id'> & { id?: number }) => void;
}

// Tipos para asistencia
interface Asistencia {
  id: number;
  empleadoId: number;
  fecha: string;
  horaEntrada: string;
  horaSalida: string;
  estado: string;
  observaciones: string;
}

const asistenciasIniciales: Asistencia[] = [
  {
    id: 1,
    empleadoId: 1,
    fecha: "2024-07-22",
    horaEntrada: "08:05",
    horaSalida: "17:00",
    estado: "Presente",
    observaciones: "-",
  },
  {
    id: 2,
    empleadoId: 2,
    fecha: "2024-07-22",
    horaEntrada: "08:15",
    horaSalida: "17:10",
    estado: "Tardanza",
    observaciones: "Llegó tarde por tráfico",
  },
  {
    id: 3,
    empleadoId: 3,
    fecha: "2024-07-22",
    horaEntrada: "-",
    horaSalida: "-",
    estado: "Falta",
    observaciones: "No avisó",
  },
];

export default function GestionEmpleadosPage() {
  const [empleados, setEmpleados] = useState<Empleado[]>(empleadosIniciales);
  const [busqueda, setBusqueda] = useState("");
  const [filtroDepartamento, setFiltroDepartamento] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [empleadoEditando, setEmpleadoEditando] = useState<Empleado | null>(null);
  const [tab, setTab] = useState<'empleados' | 'asistencia'>('empleados');

  // Estado para asistencia
  const [asistencias, setAsistencias] = useState<Asistencia[]>(asistenciasIniciales);
  const [filtroEmpleado, setFiltroEmpleado] = useState("");
  const [filtroFecha, setFiltroFecha] = useState("");
  const [mostrarModalAsistencia, setMostrarModalAsistencia] = useState(false);
  const [asistenciaEditando, setAsistenciaEditando] = useState<Asistencia | null>(null);

  // Filtrado y búsqueda
  const empleadosFiltrados = empleados.filter((emp) => {
    const coincideBusqueda =
      emp.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      emp.documento.includes(busqueda);
    const coincideDepartamento =
      !filtroDepartamento || emp.departamento === filtroDepartamento;
    const coincideEstado = !filtroEstado || emp.estado === filtroEstado;
    return coincideBusqueda && coincideDepartamento && coincideEstado;
  });

  // Filtrado de asistencias
  const asistenciasFiltradas = asistencias.filter((a) => {
    const coincideEmpleado = !filtroEmpleado || a.empleadoId === Number(filtroEmpleado);
    const coincideFecha = !filtroFecha || a.fecha === filtroFecha;
    return coincideEmpleado && coincideFecha;
  });

  // Abrir modal para nuevo empleado
  const abrirModalNuevo = () => {
    setEmpleadoEditando(null);
    setMostrarModal(true);
  };

  // Abrir modal para editar
  const abrirModalEditar = (emp: Empleado) => {
    setEmpleadoEditando(emp);
    setMostrarModal(true);
  };

  // Guardar empleado (nuevo o editado)
  const guardarEmpleado = (emp: Omit<Empleado, 'id'> & { id?: number }) => {
    if (emp.id) {
      setEmpleados((prev) => prev.map((e) => (e.id === emp.id ? { ...emp, id: emp.id, email: emp.email || '', telefono: emp.telefono || '' } : e)));
    } else {
      setEmpleados((prev) => [
        ...prev,
        {
          ...emp,
          id: prev.length ? Math.max(...prev.map((e) => e.id)) + 1 : 1,
          email: emp.email || '',
          telefono: emp.telefono || '',
        },
      ]);
    }
    setMostrarModal(false);
  };

  // Abrir modal para nueva asistencia
  const abrirModalNuevaAsistencia = () => {
    setAsistenciaEditando(null);
    setMostrarModalAsistencia(true);
  };

  // Guardar asistencia (nuevo o editado)
  const guardarAsistencia = (asist: Omit<Asistencia, 'id'> & { id?: number }) => {
    if (asist.id) {
      setAsistencias((prev) => prev.map((a) => (a.id === asist.id ? { ...asist, id: asist.id } : a)));
    } else {
      setAsistencias((prev) => [
        ...prev,
        {
          ...asist,
          id: prev.length ? Math.max(...prev.map((a) => a.id)) + 1 : 1,
        },
      ]);
    }
    setMostrarModalAsistencia(false);
  };

  // Eliminar empleado
  const eliminarEmpleado = (id: number) => {
    if (window.confirm("¿Seguro que deseas eliminar este empleado?")) {
      setEmpleados((prev) => prev.filter((e) => e.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Pestañas */}
          <div className="flex gap-4 border-b mb-8">
            <button
              className={`px-4 py-2 font-semibold border-b-2 transition-colors ${tab === 'empleados' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-blue-600'}`}
              onClick={() => setTab('empleados')}
            >
              Empleados
            </button>
            <button
              className={`px-4 py-2 font-semibold border-b-2 transition-colors ${tab === 'asistencia' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-blue-600'}`}
              onClick={() => setTab('asistencia')}
            >
              Asistencia
            </button>
          </div>

          {/* Contenido de pestañas */}
          {tab === 'empleados' && (
            <>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Gestión de Empleados</h1>
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded shadow"
                  onClick={abrirModalNuevo}
                >
                  + Agregar empleado
                </button>
              </div>

              {/* Filtros y búsqueda */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <input
                  type="text"
                  placeholder="Buscar por nombre o documento..."
                  className="border rounded px-3 py-2 w-full md:w-1/3"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
                <select
                  className="border rounded px-3 py-2 w-full md:w-1/4"
                  value={filtroDepartamento}
                  onChange={(e) => setFiltroDepartamento(e.target.value)}
                >
                  <option value="">Todos los departamentos</option>
                  {departamentos.map((dep) => (
                    <option key={dep} value={dep}>{dep}</option>
                  ))}
                </select>
                <select
                  className="border rounded px-3 py-2 w-full md:w-1/4"
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                >
                  <option value="">Todos los estados</option>
                  {estados.map((est) => (
                    <option key={est} value={est}>{est}</option>
                  ))}
                </select>
              </div>

              {/* Tabla de empleados */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cargo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Departamento</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha de ingreso</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {empleadosFiltrados.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                          No hay empleados para mostrar.
                        </td>
                      </tr>
                    )}
                    {empleadosFiltrados.map((emp) => (
                      <tr key={emp.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{emp.nombre}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{emp.cargo}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{emp.departamento}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{emp.fechaIngreso}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{emp.estado}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                          <button
                            className="text-blue-600 hover:underline mr-3"
                            onClick={() => abrirModalEditar(emp)}
                          >Editar</button>
                          <button
                            className="text-red-600 hover:underline"
                            onClick={() => eliminarEmpleado(emp.id)}
                          >Eliminar</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {tab === 'asistencia' && (
            <>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Control de Asistencia</h1>
                <button
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded shadow"
                  onClick={abrirModalNuevaAsistencia}
                >
                  + Registrar asistencia
                </button>
              </div>
              {/* Filtros */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <select
                  className="border rounded px-3 py-2 w-full md:w-1/3"
                  value={filtroEmpleado}
                  onChange={(e) => setFiltroEmpleado(e.target.value)}
                >
                  <option value="">Todos los empleados</option>
                  {empleados.map((emp) => (
                    <option key={emp.id} value={emp.id}>{emp.nombre}</option>
                  ))}
                </select>
                <input
                  type="date"
                  className="border rounded px-3 py-2 w-full md:w-1/4"
                  value={filtroFecha}
                  onChange={(e) => setFiltroFecha(e.target.value)}
                />
              </div>
              {/* Tabla de asistencias */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empleado</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hora entrada</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hora salida</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Observaciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {asistenciasFiltradas.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                          No hay registros de asistencia para mostrar.
                        </td>
                      </tr>
                    )}
                    {asistenciasFiltradas.map((a) => {
                      const empleado = empleados.find((e) => e.id === a.empleadoId);
                      return (
                        <tr key={a.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{empleado ? empleado.nombre : 'Desconocido'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{a.fecha}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{a.horaEntrada}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{a.horaSalida}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{a.estado}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{a.observaciones}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal de formulario de empleados */}
      {mostrarModal && (
        <ModalEmpleado
          empleado={empleadoEditando}
          onClose={() => setMostrarModal(false)}
          onSave={guardarEmpleado}
        />
      )}
      {/* Modal de formulario de asistencia */}
      {mostrarModalAsistencia && (
        <ModalAsistencia
          empleados={empleados}
          asistencia={asistenciaEditando}
          onClose={() => setMostrarModalAsistencia(false)}
          onSave={guardarAsistencia}
        />
      )}
    </div>
  );
}

// Componente ModalEmpleado
function ModalEmpleado({ empleado, onClose, onSave }: ModalEmpleadoProps) {
  const [form, setForm] = useState<Omit<Empleado, 'id'> & { id?: number }>(
    empleado || {
      nombre: "",
      documento: "",
      cargo: "",
      departamento: departamentos[0],
      fechaIngreso: "",
      estado: estados[0],
      email: "",
      telefono: "",
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.nombre || !form.documento || !form.cargo || !form.fechaIngreso) {
      alert("Por favor, completa los campos obligatorios.");
      return;
    }
    onSave({ ...form, id: empleado?.id });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg relative">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl"
          onClick={onClose}
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-4 text-gray-900 text-center">
          {empleado ? "Editar empleado" : "Nuevo empleado"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo *</label>
              <input
                type="text"
                name="nombre"
                className="border rounded px-3 py-2 w-full"
                value={form.nombre}
                onChange={handleChange}
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Documento *</label>
              <input
                type="text"
                name="documento"
                className="border rounded px-3 py-2 w-full"
                value={form.documento}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Cargo *</label>
              <input
                type="text"
                name="cargo"
                className="border rounded px-3 py-2 w-full"
                value={form.cargo}
                onChange={handleChange}
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Departamento *</label>
              <select
                name="departamento"
                className="border rounded px-3 py-2 w-full"
                value={form.departamento}
                onChange={handleChange}
                required
              >
                {departamentos.map((dep) => (
                  <option key={dep} value={dep}>{dep}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de ingreso *</label>
              <input
                type="date"
                name="fechaIngreso"
                className="border rounded px-3 py-2 w-full"
                value={form.fechaIngreso}
                onChange={handleChange}
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado *</label>
              <select
                name="estado"
                className="border rounded px-3 py-2 w-full"
                value={form.estado}
                onChange={handleChange}
                required
              >
                {estados.map((est) => (
                  <option key={est} value={est}>{est}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                className="border rounded px-3 py-2 w-full"
                value={form.email}
                onChange={handleChange}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <input
                type="text"
                name="telefono"
                className="border rounded px-3 py-2 w-full"
                value={form.telefono}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal para asistencia
interface ModalAsistenciaProps {
  empleados: Empleado[];
  asistencia: Asistencia | null;
  onClose: () => void;
  onSave: (asist: Omit<Asistencia, 'id'> & { id?: number }) => void;
}

function ModalAsistencia({ empleados, asistencia, onClose, onSave }: ModalAsistenciaProps) {
  const [form, setForm] = useState<Omit<Asistencia, 'id'> & { id?: number }>(
    asistencia || {
      empleadoId: empleados[0]?.id || 0,
      fecha: '',
      horaEntrada: '',
      horaSalida: '',
      estado: 'Presente',
      observaciones: '',
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.empleadoId || !form.fecha) {
      alert('Por favor, selecciona un empleado y una fecha.');
      return;
    }
    onSave({ ...form, empleadoId: Number(form.empleadoId), id: asistencia?.id });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg relative">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl"
          onClick={onClose}
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-4 text-gray-900 text-center">
          {asistencia ? 'Editar asistencia' : 'Registrar asistencia'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Empleado *</label>
            <select
              name="empleadoId"
              className="border rounded px-3 py-2 w-full"
              value={form.empleadoId}
              onChange={handleChange}
              required
            >
              {empleados.map((emp) => (
                <option key={emp.id} value={emp.id}>{emp.nombre}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha *</label>
              <input
                type="date"
                name="fecha"
                className="border rounded px-3 py-2 w-full"
                value={form.fecha}
                onChange={handleChange}
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado *</label>
              <select
                name="estado"
                className="border rounded px-3 py-2 w-full"
                value={form.estado}
                onChange={handleChange}
                required
              >
                <option value="Presente">Presente</option>
                <option value="Tardanza">Tardanza</option>
                <option value="Falta">Falta</option>
                <option value="Permiso">Permiso</option>
              </select>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Hora entrada</label>
              <input
                type="time"
                name="horaEntrada"
                className="border rounded px-3 py-2 w-full"
                value={form.horaEntrada}
                onChange={handleChange}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Hora salida</label>
              <input
                type="time"
                name="horaSalida"
                className="border rounded px-3 py-2 w-full"
                value={form.horaSalida}
                onChange={handleChange}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
            <input
              type="text"
              name="observaciones"
              className="border rounded px-3 py-2 w-full"
              value={form.observaciones}
              onChange={handleChange}
            />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 