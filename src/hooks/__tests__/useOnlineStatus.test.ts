import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

function setNavigatorOnlineStatus(value: boolean) {
  Object.defineProperty(window.navigator, 'onLine', {
    configurable: true,
    value,
  });
}

describe('useOnlineStatus', () => {
  beforeEach(() => {
    vi.resetModules();
    setNavigatorOnlineStatus(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('returns true when navigator.onLine is true', async () => {
    setNavigatorOnlineStatus(true);

    const { useOnlineStatus } = await import('../useOnlineStatus');
    const { result } = renderHook(() => useOnlineStatus());

    expect(result.current.isOnline).toBe(true);
    expect(result.current.syncStatus).toBe('synced');
  });

  it('updates to false when offline event fires', async () => {
    const { useOnlineStatus } = await import('../useOnlineStatus');
    const { result } = renderHook(() => useOnlineStatus());

    act(() => {
      setNavigatorOnlineStatus(false);
      window.dispatchEvent(new Event('offline'));
    });

    expect(result.current.isOnline).toBe(false);
    expect(result.current.syncStatus).toBe('offline');
  });

  it('transitions from syncing to synced when online event fires', async () => {
    vi.useFakeTimers();
    setNavigatorOnlineStatus(false);

    const { useOnlineStatus } = await import('../useOnlineStatus');
    const { result } = renderHook(() => useOnlineStatus());

    act(() => {
      setNavigatorOnlineStatus(true);
      window.dispatchEvent(new Event('online'));
    });

    expect(result.current.isOnline).toBe(true);
    expect(result.current.syncStatus).toBe('syncing');

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current.syncStatus).toBe('synced');
  });

  it('cleans up listeners on unmount', async () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

    const { useOnlineStatus } = await import('../useOnlineStatus');
    const { unmount } = renderHook(() => useOnlineStatus());

    const onlineHandler = addEventListenerSpy.mock.calls.find(
      ([eventName]) => eventName === 'online',
    )?.[1];
    const offlineHandler = addEventListenerSpy.mock.calls.find(
      ([eventName]) => eventName === 'offline',
    )?.[1];

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'online',
      onlineHandler,
    );
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'offline',
      offlineHandler,
    );
  });
});
