"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Define el tipo para el usuario
export type RootUser = {
  id: number;
  nombre: string;
  rol: string;
  email?: string;
  isLoading?: boolean;
};

// Crear el contexto
const UserContext = createContext<RootUser>({
  id: 0,
  nombre: "",
  rol: "",
  isLoading: true
});

// Hook personalizado para usar el contexto
export const useUser = () => useContext(UserContext);

// Proveedor del contexto
export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<RootUser>({
    id: 0,
    nombre: "",
    rol: "",
    isLoading: true
  });
  const router = useRouter();

  useEffect(() => {
    const verifySession = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          const trabajador = data.datos;
          
          setUser({
            id: trabajador.id,
            nombre: trabajador.nombre,
            rol: trabajador.rol?.nombre || 'USER',
            email: trabajador.email,
            isLoading: false
          });
        } else {
          // Si no está autenticado, redirigir al login
          router.push('/login');
        }
      } catch (error) {
        console.error('Error verificando sesión:', error);
        router.push('/login');
      }
    };

    verifySession();
  }, []);

  return (
    <UserContext.Provider value={user}>
      {children}
    </UserContext.Provider>
  );
}
