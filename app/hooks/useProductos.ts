'use client';

import { useState, useEffect, useCallback } from 'react';

// Cache en memoria para productos
let productosCache: Map<number, number> | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export const useProductos = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getProductosPrecios = useCallback(async (): Promise<Map<number, number>> => {
    const now = Date.now();
    
    // Verificar si el cache es válido
    if (productosCache && (now - cacheTimestamp) < CACHE_DURATION) {
      return productosCache;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/getproductos');
      if (!response.ok) {
        throw new Error('Error al obtener productos');
      }

      const productos = await response.json();
      
      // Actualizar cache
      productosCache = new Map(productos.map((prod: any) => [prod.id, prod.precioUnitario || 0]));
      cacheTimestamp = now;
      
      return productosCache;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearCache = useCallback(() => {
    productosCache = null;
    cacheTimestamp = 0;
  }, []);

  return {
    getProductosPrecios,
    clearCache,
    loading,
    error
  };
};