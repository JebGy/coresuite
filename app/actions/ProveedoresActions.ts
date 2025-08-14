"use server";
import { Proveedor } from "@/types";

export async function getProveedores(): Promise<Proveedor[]> {
  try {
    const response = await fetch("/api/proveedores");
    if (!response.ok) throw new Error("Error al obtener proveedores");
    return await response.json();
  } catch (error) {
    console.error("Error:", error);
    return [];
  }
}

export async function addProveedor(
  proveedor: Omit<Proveedor, "id" | "createdAt" | "updatedAt">
): Promise<Proveedor | null> {
  try {
    const response = await fetch("/api/proveedores", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(proveedor),
    });

    if (!response.ok) throw new Error("Error al crear proveedor");
    return await response.json();
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}

export async function getRucData(rucValue: string) {
  try {
    const apikey = process.env.SUNAT_API_KEY;

    const response = await fetch(
      `https://dniruc.apisperu.com/api/v1/ruc/${rucValue}?token=${apikey}`
    );
    return response.json();
  } catch (error) {
    console.error("Error al obtener datos:", error);
    throw error;
  }
}
