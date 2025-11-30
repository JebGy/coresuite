jest.mock('@/lib/prisma', () => ({
  prisma: {
    producto: {
      findMany: jest.fn(async () => ([
        { id: 1, nombre: 'A', almacen: {}, movimientos: [{ precioUnitario: 12 }] },
        { id: 2, nombre: 'B', almacen: {}, movimientos: [] },
      ]))
    }
  }
}));

import handler from '../../pages/api/getproductos';
import { createReqRes } from './testUtils';
import { prisma } from '@/lib/prisma';

describe('API getproductos', () => {
  it('retorna 200 con productos y precios', async () => {
    const { req, res } = createReqRes('GET');
    await handler(req as any, res as any);
    expect(res._getStatus()).toBe(200);
    const data = res._getJSON();
    expect(Array.isArray(data)).toBe(true);
    expect(data[0].precioUnitario).toBe(12);
    expect(data[1].precioUnitario).toBe(0);
  });

  it('retorna 405 cuando método no es GET', async () => {
    const { req, res } = createReqRes('POST');
    await handler(req as any, res as any);
    expect(res._getStatus()).toBe(405);
  });

  it('retorna 500 cuando prisma falla', async () => {
    (prisma.producto.findMany as jest.Mock).mockRejectedValueOnce(new Error('db error'));
    const { req, res } = createReqRes('GET');
    await handler(req as any, res as any);
    expect(res._getStatus()).toBe(500);
    expect(res._getJSON()).toEqual({ error: 'Internal server error' });
  });
});
