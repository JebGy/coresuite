import { renderHook, act } from '@testing-library/react';
import { useProductos } from './useProductos';

const mockProductos = [
  { id: 1, precioUnitario: 10 },
  { id: 2, precioUnitario: 0 },
  { id: 3, precioUnitario: undefined },
];

describe('useProductos', () => {
  beforeEach(() => {
    // @ts-ignore
    global.fetch = jest.fn();
    jest.useFakeTimers();
    jest.spyOn(Date, 'now').mockReturnValue(1000000);
    const { result } = renderHook(() => useProductos());
    act(() => result.current.clearCache());
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
    // @ts-ignore
    global.fetch = undefined;
    (Date.now as jest.Mock).mockRestore?.();
  });

  it('obtiene y cachea precios (happy path)', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockProductos,
    });

    const { result } = renderHook(() => useProductos());

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();

    const precios = await act(async () => result.current.getProductosPrecios());

    expect(global.fetch).toHaveBeenCalledWith('/api/getproductos');
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();

    const map = precios as Map<number, number>;
    expect(map.get(1)).toBe(10);
    expect(map.get(2)).toBe(0);
    expect(map.get(3)).toBe(0);
  });

  it('usa cache válido y evita refetch', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockProductos,
    });

    const { result } = renderHook(() => useProductos());

    const first = await act(async () => result.current.getProductosPrecios());
    expect(global.fetch).toHaveBeenCalledTimes(1);

    // Avanza tiempo dentro de la duración de cache
    jest.advanceTimersByTime(60_000);

    const second = await act(async () => result.current.getProductosPrecios());
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(second).toBe(first);

    // Limpiar cache y forzar refetch
    act(() => result.current.clearCache());
    await act(async () => result.current.getProductosPrecios());
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('maneja errores de red y expone mensaje', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false });

    const { result } = renderHook(() => useProductos());
    await act(async () => {
      await expect(result.current.getProductosPrecios()).rejects.toBeDefined();
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Error al obtener productos');
  });

  it('maneja excepción de fetch y expone el mensaje', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('fallo de red'));
    const { result } = renderHook(() => useProductos());
    await act(async () => {
      try {
        await result.current.getProductosPrecios();
      } catch (e) {}
    });
    expect(result.current.error).toBe('fallo de red');
    expect(result.current.loading).toBe(false);
  });

  it('refetch cuando expiró el cache', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => mockProductos })
      .mockResolvedValueOnce({ ok: true, json: async () => mockProductos });

    const { result } = renderHook(() => useProductos());
    await act(async () => {
      await result.current.getProductosPrecios();
    });
    expect(global.fetch).toHaveBeenCalledTimes(1);

    (Date.now as jest.Mock).mockReturnValue(1000000 + 301000);

    await act(async () => {
      await result.current.getProductosPrecios();
    });
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });
});
