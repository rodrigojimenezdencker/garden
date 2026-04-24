import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Skeleton } from '../Skeleton';

describe('Skeleton', () => {
  it('renders an aria-hidden loading placeholder', () => {
    const { container } = render(<Skeleton className="h-10 w-10" />);

    const skeleton = container.firstElementChild;
    expect(skeleton).not.toBeNull();
    expect(skeleton).toHaveAttribute('aria-hidden', 'true');
    expect(screen.queryByRole('presentation')).not.toBeInTheDocument();
    expect(skeleton?.className).toContain('animate-pulse');
  });
});
