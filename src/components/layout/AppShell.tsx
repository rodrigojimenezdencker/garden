import type { ReactNode } from 'react';
import { InstallPrompt } from '../InstallPrompt';
import { OfflineIndicator } from '../OfflineIndicator';
import { ReminderBanner } from '../ReminderBanner';
import { BottomNav } from './BottomNav';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface AppShellProps {
  children: ReactNode;
  activeItem?: string;
}

export function AppShell({
  children,
  activeItem = 'dashboard',
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-garden-50">
      <Header />

      <div className="flex pt-14">
        <Sidebar activeItem={activeItem} />

        <main className="min-w-0 flex-1 overflow-y-auto pb-16 md:ml-60 md:pb-0">
          <InstallPrompt />
          <OfflineIndicator />
          <ReminderBanner />
          {children}
        </main>
      </div>

      <BottomNav activeItem={activeItem} />
    </div>
  );
}
