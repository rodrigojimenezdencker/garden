import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  INSTALL_PROMPT_DISMISSED_KEY,
  INSTALL_PROMPT_VISIT_COUNT_KEY,
  InstallPrompt,
} from '../InstallPrompt';

interface MockBeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
}

function dispatchBeforeInstallPrompt() {
  const event = new Event('beforeinstallprompt', {
    bubbles: true,
    cancelable: true,
  }) as MockBeforeInstallPromptEvent;

  event.prompt = async () => undefined;
  event.userChoice = Promise.resolve({
    outcome: 'accepted',
    platform: 'web',
  });

  window.dispatchEvent(event);

  return event;
}

describe('InstallPrompt', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('renders install button on the second visit when beforeinstallprompt fires', async () => {
    window.localStorage.setItem(INSTALL_PROMPT_VISIT_COUNT_KEY, '1');

    render(<InstallPrompt />);

    await act(async () => {
      dispatchBeforeInstallPrompt();
    });

    expect(
      await screen.findByRole('button', { name: 'Instalar' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Añadir Mi Jardín a la pantalla de inicio'),
    ).toBeInTheDocument();
  });

  it('hides after dismissal', async () => {
    window.localStorage.setItem(INSTALL_PROMPT_VISIT_COUNT_KEY, '1');

    render(<InstallPrompt />);

    await act(async () => {
      dispatchBeforeInstallPrompt();
    });

    fireEvent.click(await screen.findByRole('button', { name: 'Ahora no' }));

    expect(
      screen.queryByText('Añadir Mi Jardín a la pantalla de inicio'),
    ).not.toBeInTheDocument();
    expect(window.localStorage.getItem(INSTALL_PROMPT_DISMISSED_KEY)).toBe(
      'true',
    );
  });

  it('does not show when already dismissed', () => {
    window.localStorage.setItem(INSTALL_PROMPT_VISIT_COUNT_KEY, '1');
    window.localStorage.setItem(INSTALL_PROMPT_DISMISSED_KEY, 'true');

    render(<InstallPrompt />);

    act(() => {
      dispatchBeforeInstallPrompt();
    });

    expect(
      screen.queryByText('Añadir Mi Jardín a la pantalla de inicio'),
    ).not.toBeInTheDocument();
  });

  it('does not show on the first visit even when beforeinstallprompt fires', async () => {
    render(<InstallPrompt />);

    await act(async () => {
      dispatchBeforeInstallPrompt();
    });

    expect(
      screen.queryByText('Añadir Mi Jardín a la pantalla de inicio'),
    ).not.toBeInTheDocument();
    expect(window.localStorage.getItem(INSTALL_PROMPT_VISIT_COUNT_KEY)).toBe(
      '1',
    );
  });
});
