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
    mockUseOnlineStatus.mockReturnValue({ isOnline: true });

    const { container } = render(<OfflineIndicator />);

    expect(container).toBeEmptyDOMElement();
  });

  it('shows offline message when offline', () => {
    mockUseOnlineStatus.mockReturnValue({ isOnline: false });

    render(<OfflineIndicator />);

    expect(
      screen.getByText(
        'Sin conexión — los cambios se guardarán cuando vuelvas a conectar',
      ),
    ).toBeInTheDocument();
  });

  it('shows reconnect message when going back online', () => {
    vi.useFakeTimers();
    mockUseOnlineStatus.mockReturnValue({ isOnline: false });

    const { rerender } = render(<OfflineIndicator />);

    mockUseOnlineStatus.mockReturnValue({ isOnline: true });
    rerender(<OfflineIndicator />);

    expect(screen.getByText('Conectado de nuevo ✓')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(screen.queryByText('Conectado de nuevo ✓')).not.toBeInTheDocument();
  });
});
