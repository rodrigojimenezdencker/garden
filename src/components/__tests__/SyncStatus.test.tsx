import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SyncStatus } from '../SyncStatus';

const mockUseOnlineStatus = vi.fn();

vi.mock('../../hooks/useOnlineStatus', () => ({
  useOnlineStatus: () => mockUseOnlineStatus(),
}));

describe('SyncStatus', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('shows updated state when synced', () => {
    mockUseOnlineStatus.mockReturnValue({
      isOnline: true,
      syncStatus: 'synced',
    });

    render(<SyncStatus />);

    const status = screen.getByLabelText('Todo actualizado');
    const dot = status.querySelector('span[aria-hidden="true"]');

    expect(status).toBeInTheDocument();
    expect(dot?.className).toContain('bg-garden-300');
  });

  it('shows pulsing garden dot while syncing', () => {
    mockUseOnlineStatus.mockReturnValue({
      isOnline: true,
      syncStatus: 'syncing',
    });

    render(<SyncStatus />);

    const status = screen.getByLabelText('Sincronizando');
    const dot = status.querySelector('span[aria-hidden="true"]');

    expect(status).toBeInTheDocument();
    expect(dot?.className).toContain('bg-garden-400');
    expect(dot?.className).toContain('animate-pulse');
  });

  it('shows gray dot with "Sin conexión" label when offline', () => {
    mockUseOnlineStatus.mockReturnValue({
      isOnline: false,
      syncStatus: 'offline',
    });

    render(<SyncStatus />);

    const status = screen.getByLabelText('Sin conexión');
    const dot = status.querySelector('span[aria-hidden="true"]');

    expect(status).toBeInTheDocument();
    expect(dot?.className).toContain('bg-gray-300');
  });
});
