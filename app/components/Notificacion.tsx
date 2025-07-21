import React, { useEffect } from 'react';

interface NotificacionProps {
  mensaje: string;
  tipo?: 'exito' | 'error' | 'info';
  onClose: () => void;
  duracion?: number; // en ms
}

const colores = {
  exito: 'bg-green-500',
  error: 'bg-red-500',
  info: 'bg-blue-500',
};

export const Notificacion: React.FC<NotificacionProps> = ({ mensaje, tipo = 'info', onClose, duracion = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duracion);
    return () => clearTimeout(timer);
  }, [onClose, duracion]);

  return (
    <div
      className={`fixed top-6 right-6 z-50 shadow-lg rounded-lg px-6 py-4 text-white flex items-center gap-3 animate-fade-in-up ${colores[tipo]}`}
      style={{ minWidth: 240 }}
      role="alert"
    >
      <span className="flex-1">{mensaje}</span>
      <button onClick={onClose} className="ml-4 text-white/80 hover:text-white font-bold">×</button>
    </div>
  );
};

// Animación fade-in-up (puedes agregar esto en tu CSS global o Tailwind config)
// @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px);} to { opacity: 1; transform: none;} }
// .animate-fade-in-up { animation: fade-in-up 0.4s cubic-bezier(0.4,0,0.2,1); } 