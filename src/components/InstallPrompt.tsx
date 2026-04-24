import { useEffect, useState } from 'react';
import { Button } from './ui/Button';

export const INSTALL_PROMPT_DISMISSED_KEY =
  'garden-app-install-prompt-dismissed';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
}

export function InstallPrompt() {
  const [installEvent, setInstallEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isDismissed, setIsDismissed] = useState(true);

  useEffect(() => {
    setIsDismissed(
      window.localStorage.getItem(INSTALL_PROMPT_DISMISSED_KEY) === 'true',
    );

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt,
      );
    };
  }, []);

  const handleDismiss = () => {
    window.localStorage.setItem(INSTALL_PROMPT_DISMISSED_KEY, 'true');
    setIsDismissed(true);
  };

  const handleInstall = async () => {
    if (!installEvent) {
      return;
    }

    await installEvent.prompt();
    await installEvent.userChoice;
    setInstallEvent(null);
  };

  if (isDismissed || !installEvent) {
    return null;
  }

  return (
    <section
      aria-live="polite"
      className="mx-4 mt-4 flex flex-col gap-3 rounded-2xl border border-garden-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between"
    >
      <div className="space-y-1">
        <p className="text-sm font-semibold text-garden-900">
          Añadir Mi Jardín a la pantalla de inicio
        </p>
        <p className="text-sm text-garden-700">
          Instala la app para abrirla más rápido y usarla como experiencia
          completa.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button onClick={handleInstall} size="sm">
          Instalar
        </Button>
        <Button onClick={handleDismiss} size="sm" variant="ghost">
          Ahora no
        </Button>
      </div>
    </section>
  );
}
