jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn(() => ({
      solicitud: {
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    })),
  };
});

import handler from '../../pages/api/solicitudes/[id]';
import { createReqRes } from './testUtils';
import { PrismaClient } from '@prisma/client';

describe('API solicitudes/[id]', () => {
  const prisma = new PrismaClient() as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('400 si id inválido', async () => {
    const { req, res } = createReqRes('GET', { query: { id: ['x'] } });
    await handler(req as any, res as any);
    expect(res._getStatus()).toBe(400);
  });

  it('GET 404 si no existe', async () => {
    prisma.solicitud.findUnique.mockResolvedValueOnce(null);
    const { req, res } = createReqRes('GET', { query: { id: '1' } });
    await handler(req as any, res as any);
    expect(res._getStatus()).toBe(404);
  });

  it('GET 200 si existe', async () => {
    prisma.solicitud.findUnique.mockResolvedValueOnce({ id: 1, usuario: { nombres: 'A', apellidos: 'B', email: 'a@b.com' } });
    const { req, res } = createReqRes('GET', { query: { id: '1' } });
    await handler(req as any, res as any);
    expect(res._getStatus()).toBe(200);
    expect(res._getJSON()).toHaveProperty('solicitud');
  });

  it('PUT 400 por estado inválido', async () => {
    const { req, res } = createReqRes('PUT', { query: { id: '1' }, body: { estado: 'X' } });
    await handler(req as any, res as any);
    expect(res._getStatus()).toBe(400);
  });

  it('PUT 400 por motivo requerido al rechazar', async () => {
    const { req, res } = createReqRes('PUT', { query: { id: '1' }, body: { estado: 'RECHAZADO' } });
    await handler(req as any, res as any);
    expect(res._getStatus()).toBe(400);
  });

  it('PUT 404 si solicitud no existe', async () => {
    prisma.solicitud.findUnique.mockResolvedValueOnce(null);
    const { req, res } = createReqRes('PUT', { query: { id: '1' }, body: { estado: 'APROBADO' } });
    await handler(req as any, res as any);
    expect(res._getStatus()).toBe(404);
  });

  it('PUT 200 actualización exitosa', async () => {
    prisma.solicitud.findUnique.mockResolvedValueOnce({ asunto: 'S', usuario: { nombres: 'A', apellidos: 'B', email: 'a@b.com' } });
    prisma.solicitud.update.mockResolvedValueOnce({ id: 1, estado: 'APROBADO', usuario: { id: 1, nombres: 'A', apellidos: 'B', email: 'a@b.com' } });
    const { req, res } = createReqRes('PUT', { query: { id: '1' }, body: { estado: 'APROBADO' } });
    await handler(req as any, res as any);
    expect(res._getStatus()).toBe(200);
  });

  it('DELETE 404 si no existe', async () => {
    prisma.solicitud.findUnique.mockResolvedValueOnce(null);
    const { req, res } = createReqRes('DELETE', { query: { id: '1' }, body: {} });
    await handler(req as any, res as any);
    expect(res._getStatus()).toBe(404);
  });

  it('DELETE 400 si estado no PENDIENTE', async () => {
    prisma.solicitud.findUnique.mockResolvedValueOnce({ estado: 'APROBADO' });
    const { req, res } = createReqRes('DELETE', { query: { id: '1' }, body: {} });
    await handler(req as any, res as any);
    expect(res._getStatus()).toBe(400);
  });

  it('DELETE 200 si se elimina', async () => {
    prisma.solicitud.findUnique.mockResolvedValueOnce({ estado: 'PENDIENTE' });
    prisma.solicitud.delete.mockResolvedValueOnce({});
    const { req, res } = createReqRes('DELETE', { query: { id: '1' }, body: {} });
    await handler(req as any, res as any);
    expect(res._getStatus()).toBe(200);
  });
});
