import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { OfflineIndicator } from '../OfflineIndicator';

const mockUseOnlineStatus = vi.fn();

vi.mock('../../hooks/useOnlineStatus', () => ({
  useOnlineStatus: () => mockUseOnlineStatus(),
}));

describe('OfflineIndicator', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it('renders nothing when online', () => {
    mockUseOnlineStatus.mockReturnValue({
      isOnline: true,
      syncStatus: 'synced',
    });

    const { container } = render(<OfflineIndicator />);

    expect(container).toBeEmptyDOMElement();
  });

  it('shows offline message when offline', () => {
    mockUseOnlineStatus.mockReturnValue({
      isOnline: false,
      syncStatus: 'offline',
    });

    render(<OfflineIndicator />);

    expect(
      screen.getByText(
        'Sin conexión — los cambios se guardarán cuando vuelvas a conectar',
      ),
    ).toBeInTheDocument();
  });

  it('shows syncing state while reconnecting', () => {
    mockUseOnlineStatus.mockReturnValue({
      isOnline: true,
      syncStatus: 'syncing',
    });

    render(<OfflineIndicator />);

    expect(screen.getByText('Sincronizando...')).toBeInTheDocument();
  });

  it('shows synced message after syncing completes', () => {
    vi.useFakeTimers();
    mockUseOnlineStatus.mockReturnValue({
      isOnline: false,
      syncStatus: 'offline',
    });

    const { rerender } = render(<OfflineIndicator />);

    mockUseOnlineStatus.mockReturnValue({
      isOnline: true,
      syncStatus: 'syncing',
    });
    rerender(<OfflineIndicator />);

    mockUseOnlineStatus.mockReturnValue({
      isOnline: true,
      syncStatus: 'synced',
    });
    rerender(<OfflineIndicator />);

    expect(screen.getByText('Todo actualizado ✓')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(screen.queryByText('Todo actualizado ✓')).not.toBeInTheDocument();
  });
});
