"use client";
import { createContext, useContext } from 'react';

// Define el tipo para el usuario ROOT
export type RootUser = {
  id: number;
  nombre: string;
  rol: string;
};

// Crear el contexto
const UserContext = createContext<RootUser>({
  id: 1,  // Using 1 as the ROOT user ID
  nombre: "Administrador",
  rol: "ADMIN"
});

// Hook personalizado para usar el contexto
export const useUser = () => useContext(UserContext);

// Proveedor del contexto
export function UserProvider({ children }: { children: React.ReactNode }) {
  const rootUser = {
    id: 1,  // Using 1 as the ROOT user ID
    nombre: "Administrador",
    rol: "ADMIN"
  };

  return (
    <UserContext.Provider value={rootUser}>
      {children}
    </UserContext.Provider>
  );
}
