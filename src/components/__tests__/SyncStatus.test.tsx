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

  it('shows green dot with "En línea" label when online', () => {
    mockUseOnlineStatus.mockReturnValue({ isOnline: true });

    render(<SyncStatus />);

    const status = screen.getByLabelText('En línea');
    const dot = status.querySelector('span[aria-hidden="true"]');

    expect(status).toBeInTheDocument();
    expect(dot?.className).toContain('bg-garden-300');
  });

  it('shows gray dot with "Sin conexión" label when offline', () => {
    mockUseOnlineStatus.mockReturnValue({ isOnline: false });

    render(<SyncStatus />);

    const status = screen.getByLabelText('Sin conexión');
    const dot = status.querySelector('span[aria-hidden="true"]');

    expect(status).toBeInTheDocument();
    expect(dot?.className).toContain('bg-gray-300');
  });
});
