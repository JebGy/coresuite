import { render, screen } from '@testing-library/react';
import { UserProvider, useUser } from './UserContext';

jest.mock('next/navigation', () => {
  const push = jest.fn();
  return {
    useRouter: () => ({ push }),
    usePathname: () => mockedPathname.current,
    __push: push,
  };
});

const mockedPathname = { current: '/app' } as any;

function TestComp() {
  const user = useUser();
  return <div data-testid="user" data-loading={user.isLoading} data-rol={user.rol} />;
}

describe('UserProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // @ts-ignore
    global.fetch = jest.fn();
  });

  it('no verifica sesión en rutas públicas exactas', async () => {
    mockedPathname.current = '/login';
    render(<UserProvider><TestComp /></UserProvider>);
    const el = await screen.findByTestId('user');
    expect(el.getAttribute('data-loading')).toBe('false');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('no verifica sesión en subrutas públicas', async () => {
    mockedPathname.current = '/registro-proveedor/123';
    render(<UserProvider><TestComp /></UserProvider>);
    const el = await screen.findByTestId('user');
    expect(el.getAttribute('data-loading')).toBe('false');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('redirige a login cuando auth falla en ruta protegida', async () => {
    mockedPathname.current = '/application';
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false });
    const nav = require('next/navigation');
    render(<UserProvider><TestComp /></UserProvider>);
    await screen.findByTestId('user');
    expect(nav.__push).toHaveBeenCalledWith('/login');
  });

  it('establece usuario cuando auth es ok', async () => {
    mockedPathname.current = '/application';
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ datos: { id: 1, nombre: 'John', rol: { nombre: 'ADMIN' }, unidad: { nombre: 'HQ' }, email: 'j@e.com' } })
    });
    render(<UserProvider><TestComp /></UserProvider>);
    await screen.findByTestId('user');
    await new Promise(r => setTimeout(r, 0));
    const el2 = await screen.findByTestId('user');
    expect(el2.getAttribute('data-loading')).toBe('false');
    expect(el2.getAttribute('data-rol')).toBe('ADMIN');
  });
});
