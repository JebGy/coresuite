import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SessionWrapperComponent from "./components/SessionWrapperComponent";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Core Manager - Sistema de Gestión Empresarial",
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
