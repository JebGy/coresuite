import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { notificarRegistroProveedor } from '@/lib/emailService';

interface RegistrationData {
  token: string;
  ruc: string;
  nombre: string;
  telefono?: string;
  email?: string;
  detalles?: string;
  mesesCredito?: string;
  segmentoId: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    const {
      token,
      ruc,
      nombre,
      telefono,
      email,
      detalles,
      mesesCredito,
      segmentoId
    }: RegistrationData = req.body;

    // Validaciones básicas
    if (!token || !ruc || !nombre || !segmentoId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Campos requeridos: token, ruc, nombre, segmentoId' 
      });
    }

    if (ruc.length !== 11 || !/^\d{11}$/.test(ruc)) {
      return res.status(400).json({ 
        success: false, 
        message: 'RUC debe tener 11 dígitos numéricos' 
      });
    }

    // Validar y marcar el token como usado
    const registrationToken = await prisma.proveedorRegistrationToken.findUnique({
      where: { token }
    });

    if (!registrationToken) {
      return res.status(404).json({ 
        success: false, 
        message: 'Token no válido' 
      });
    }

    if (new Date() > registrationToken.expiresAt) {
      return res.status(410).json({ 
        success: false, 
        message: 'Token expirado' 
      });
    }

    if (registrationToken.used) {
      return res.status(410).json({ 
        success: false, 
        message: 'Token ya utilizado' 
      });
    }

    // Verificar que el RUC no esté ya registrado
    const existingProveedor = await prisma.proveedor.findUnique({
      where: { ruc }
    });

    if (existingProveedor) {
      return res.status(409).json({ 
        success: false, 
        message: 'Este RUC ya está registrado' 
      });
    }

    // Verificar que el segmento existe
    const segmento = await prisma.segmento.findUnique({
      where: { id: parseInt(segmentoId.toString()) }
    });

    if (!segmento) {
      return res.status(400).json({ 
        success: false, 
        message: 'Segmento no válido' 
      });
    }

    // Si el token tiene un segmento predefinido, verificar que coincida
    if (registrationToken.segmentoId && registrationToken.segmentoId !== segmentoId) {
      return res.status(400).json({ 
        success: false, 
        message: 'El segmento no coincide con el token' 
      });
    }

    // Procesar meses de crédito
    const mesesCreditoNum = mesesCredito ? parseInt(mesesCredito, 10) : null;
    if (mesesCreditoNum !== null && (mesesCreditoNum < 0 || mesesCreditoNum > 12)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Meses de crédito debe estar entre 0 y 12' 
      });
    }

    // Crear el proveedor y marcar el token como usado en una transacción
    const result = await prisma.$transaction(async (tx) => {
      // Crear el proveedor
      const nuevoProveedor = await tx.proveedor.create({
        data: {
          ruc,
          nombre: nombre.trim(),
          telefono: telefono?.trim() || null,
          email: email?.trim() || null,
          detalles: detalles?.trim() || null,
          mesesCredito: mesesCreditoNum,
          segmentoId: Number.parseInt(segmentoId.toString()),
        },
        include: {
          segmento: true
        }
      });

      // Marcar el token como usado
      await tx.proveedorRegistrationToken.update({
        where: { token },
        data: {
          used: true,
          usedAt: new Date()
        }
      });

      return nuevoProveedor;
    });

    // Enviar notificación por email si está configurado
    try {
      if (email) {
        await notificarRegistroProveedor({
          ruc,
          razonSocial: nombre,
          email,
          telefono: telefono || 'No especificado',
          segmento: result.segmento.nombre,
          fechaRegistro: new Date().toLocaleDateString('es-PE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        });
      }
    } catch (emailError) {
      console.error('Error sending welcome email:', emailError);
      // No fallar el registro por error de email
    }

    res.status(201).json({
      success: true,
      message: 'Proveedor registrado exitosamente',
      proveedor: {
        id: result.id,
        ruc: result.ruc,
        nombre: result.nombre,
        segmento: result.segmento.nombre
      }
    });

  } catch (error) {
    console.error('Error registering provider:', error);
    
    // Manejar errores específicos de Prisma
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return res.status(409).json({ 
          success: false, 
          message: 'RUC ya registrado' 
        });
      }
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
}