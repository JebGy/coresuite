import type { Metadata } from "next";
import "./globals.css";
import SessionWrapperComponent from "./components/SessionWrapperComponent";

export const metadata: Metadata = {
  title: "CoreSuite - Sistema de Gestión Empresarial",
  description:
    "Plataforma integral de gestión empresarial con control de inventario, kardex y análisis de datos",
  keywords: "gestión empresarial, inventario, kardex, dashboard, análisis",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <SessionWrapperComponent>{children}</SessionWrapperComponent>
      </body>
    </html>
  );
}
