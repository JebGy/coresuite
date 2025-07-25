import { NextApiRequest, NextApiResponse } from 'next';
import handler from '../../pages/api/productos';
import { PrismaClient } from '@prisma/client';

// Mock de PrismaClient
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    almacen: {
      findUnique: jest.fn(),
    },
    producto: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  };
  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
  };
});

// Mock de console.log para evitar ruido en los tests
const originalConsoleLog = console.log;
beforeEach(() => {
  console.log = jest.fn();
});

afterEach(() => {
  console.log = originalConsoleLog;
  jest.clearAllMocks();
});

describe('API de Productos', () => {
  let req: Partial<NextApiRequest>;
  let res: Partial<NextApiResponse>;
  let prismaClient: PrismaClient;

  beforeEach(() => {
    // Configurar mocks para req y res
    req = {
      method: 'POST',
      body: {
        nombre: 'Producto Test',
        descripcion: 'Descripción de prueba',
        almacenId: 1,
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Obtener la instancia mock de PrismaClient
    prismaClient = new PrismaClient();
  });

  describe('POST /api/productos', () => {
    it('debería crear un producto correctamente', async () => {
      // Configurar los mocks para simular el comportamiento esperado
      const mockAlmacen = {
        id: 1,
        nombre: 'Almacen Test',
        ubicacion: 'Ubicación Test',
        descripcion: 'Descripción Test',
      };

      const mockProductoCreado = {
        id: 1,
        codigo: 'ALM-00001',
        nombre: 'Producto Test',
        descripcion: 'Descripción de prueba',
        almacenId: 1,
      };

      // Configurar el comportamiento de los mocks
      (prismaClient.almacen.findUnique as jest.Mock).mockResolvedValue(mockAlmacen);
      (prismaClient.producto.findFirst as jest.Mock).mockResolvedValue(null); // No hay productos previos
      (prismaClient.producto.create as jest.Mock).mockResolvedValue(mockProductoCreado);

      // Ejecutar el handler
      await handler(req as NextApiRequest, res as NextApiResponse);

      // Verificar que se llamaron los métodos correctos
      expect(prismaClient.almacen.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });

      expect(prismaClient.producto.findFirst).toHaveBeenCalledWith({
        where: {
          almacenId: 1,
          codigo: {
            startsWith: 'ALM',
          },
        },
        orderBy: {
          codigo: 'desc',
        },
      });

      // Verificar que se creó el producto con el código correcto
      expect(prismaClient.producto.create).toHaveBeenCalledWith({
        data: {
          codigo: 'ALM-00001',
          nombre: 'Producto Test',
          descripcion: 'Descripción de prueba',
          almacenId: 1,
        },
      });

      // Verificar la respuesta
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockProductoCreado);
    });

    it('debería generar el código correcto cuando ya existen productos', async () => {
      // Configurar los mocks para simular productos existentes
      const mockAlmacen = {
        id: 1,
        nombre: 'Almacen Test',
        ubicacion: 'Ubicación Test',
        descripcion: 'Descripción Test',
      };

      const mockUltimoProducto = {
        id: 5,
        codigo: 'ALM-00005',
        nombre: 'Producto Anterior',
        descripcion: 'Descripción anterior',
        almacenId: 1,
      };

      const mockNuevoProducto = {
        id: 6,
        codigo: 'ALM-00006',
        nombre: 'Producto Test',
        descripcion: 'Descripción de prueba',
        almacenId: 1,
      };

      // Configurar el comportamiento de los mocks
      (prismaClient.almacen.findUnique as jest.Mock).mockResolvedValue(mockAlmacen);
      (prismaClient.producto.findFirst as jest.Mock).mockResolvedValue(mockUltimoProducto);
      (prismaClient.producto.create as jest.Mock).mockResolvedValue(mockNuevoProducto);

      // Ejecutar el handler
      await handler(req as NextApiRequest, res as NextApiResponse);

      // Verificar que se creó el producto con el código correlativo correcto
      expect(prismaClient.producto.create).toHaveBeenCalledWith({
        data: {
          codigo: 'ALM-00006',
          nombre: 'Producto Test',
          descripcion: 'Descripción de prueba',
          almacenId: 1,
        },
      });

      // Verificar la respuesta
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockNuevoProducto);
    });

    it('debería generar prefijos correctos basados en el nombre del almacén', async () => {
      // Prueba con diferentes nombres de almacén para verificar la generación de prefijos
      const casosDeTest = [
        { nombreAlmacen: 'Central', prefijoEsperado: 'CEN' },
        { nombreAlmacen: 'Logística', prefijoEsperado: 'LOG' },
        { nombreAlmacen: 'Distribución', prefijoEsperado: 'DIS' },
        { nombreAlmacen: 'AB', prefijoEsperado: 'AB' },  // Nombre corto (menos de 3 caracteres)
        { nombreAlmacen: 'X', prefijoEsperado: 'X' },     // Nombre de un solo carácter
      ];

      for (const caso of casosDeTest) {
        // Limpiar mocks para cada caso
        jest.clearAllMocks();
        
        const mockAlmacen = {
          id: 1,
          nombre: caso.nombreAlmacen,
          ubicacion: 'Ubicación Test',
          descripcion: 'Descripción Test',
        };

        const codigoEsperado = `${caso.prefijoEsperado}-00001`;
        const mockProductoCreado = {
          id: 1,
          codigo: codigoEsperado,
          nombre: 'Producto Test',
          descripcion: 'Descripción de prueba',
          almacenId: 1,
        };

        // Configurar el comportamiento de los mocks
        (prismaClient.almacen.findUnique as jest.Mock).mockResolvedValue(mockAlmacen);
        (prismaClient.producto.findFirst as jest.Mock).mockResolvedValue(null);
        (prismaClient.producto.create as jest.Mock).mockResolvedValue(mockProductoCreado);

        // Ejecutar el handler
        await handler(req as NextApiRequest, res as NextApiResponse);

        // Verificar que se creó el producto con el prefijo correcto
        expect(prismaClient.producto.create).toHaveBeenCalledWith({
          data: expect.objectContaining({
            codigo: codigoEsperado,
            nombre: 'Producto Test',
            descripcion: 'Descripción de prueba',
            almacenId: 1,
          }),
        });

        // Verificar que se buscó el último producto con el prefijo correcto
        expect(prismaClient.producto.findFirst).toHaveBeenCalledWith({
          where: {
            almacenId: 1,
            codigo: {
              startsWith: caso.prefijoEsperado,
            },
          },
          orderBy: {
            codigo: 'desc',
          },
        });

        // Verificar la respuesta
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(mockProductoCreado);
      }
    });

    it('debería manejar errores al crear un producto', async () => {
      // Configurar los mocks para simular un error
      const mockAlmacen = {
        id: 1,
        nombre: 'Almacen Test',
        ubicacion: 'Ubicación Test',
        descripcion: 'Descripción Test',
      };

      // Configurar el comportamiento de los mocks
      (prismaClient.almacen.findUnique as jest.Mock).mockResolvedValue(mockAlmacen);
      (prismaClient.producto.findFirst as jest.Mock).mockResolvedValue(null);
      (prismaClient.producto.create as jest.Mock).mockRejectedValue(new Error('Error de base de datos'));

      // Ejecutar el handler
      await handler(req as NextApiRequest, res as NextApiResponse);

      // Verificar la respuesta de error
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error al crear producto' });
    });
  });
});