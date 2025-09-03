import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    const { ruc } = req.body;

    if (!ruc || typeof ruc !== 'string' || ruc.length !== 11) {
      return res.status(400).json({ 
        success: false, 
        message: 'RUC debe tener 11 dígitos' 
      });
    }

    // Verificar si el RUC ya existe en la base de datos
    const existingProveedor = await prisma.proveedor.findUnique({
      where: { ruc }
    });

    if (existingProveedor) {
      return res.status(409).json({ 
        success: false, 
        message: 'Este RUC ya está registrado como proveedor' 
      });
    }

    // Consultar datos del RUC en SUNAT
    try {
      const apikey = process.env.SUNAT_API_KEY;
      
      if (!apikey) {
        return res.status(200).json({ 
          success: true, 
          message: 'RUC válido (sin validación SUNAT)' 
        });
      }

      const response = await fetch(
        `https://dniruc.apisperu.com/api/v1/ruc/${ruc}?token=${apikey}`
      );
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.razonSocial) {
          return res.status(200).json({
            success: true,
            nombre: data.razonSocial,
            direccion: data.direccion,
            estado: data.estado,
            condicion: data.condicion
          });
        }
      }
      
      // Si no se pudo obtener datos de SUNAT, pero el RUC es válido
      return res.status(200).json({ 
        success: true, 
        message: 'RUC válido' 
      });
      
    } catch (sunatError) {
      console.error('Error consultando SUNAT:', sunatError);
      // Continuar sin datos de SUNAT
      return res.status(200).json({ 
        success: true, 
        message: 'RUC válido (sin validación SUNAT)' 
      });
    }

  } catch (error) {
    console.error('Error validating RUC:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
}