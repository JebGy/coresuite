jest.mock('./prisma', () => ({ prisma: { log: { create: jest.fn(async (args) => ({ id: 1, ...args.data })) } } }));

import { registrarLog } from './logger';
import { prisma } from './prisma';

describe('registrarLog', () => {
  it('crea registro con datos proporcionados', async () => {
    const res = await registrarLog({
      usuarioId: 7,
      accion: 'CREAR',
      entidad: 'Producto',
      entidadId: 123,
      detalles: 'Producto creado',
    });
    expect(prisma.log.create).toHaveBeenCalledWith({
      data: { usuarioId: 7, accion: 'CREAR', entidad: 'Producto', entidadId: 123, detalles: 'Producto creado' }
    });
    expect(res.id).toBe(1);
  });
});
