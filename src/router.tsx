import { Outlet, createBrowserRouter, useLocation } from 'react-router-dom';
import { AuthGuard } from './components/AuthGuard';
import { AppShell } from './components/layout/AppShell';
import { Dashboard } from './pages/Dashboard';
import { History } from './pages/History';
import { Login } from './pages/Login';
import { Plants } from './pages/Plants';
import { Settings } from './pages/Settings';
import { Watering } from './pages/Watering';

function getActiveItemFromPath(pathname: string): string {
  if (pathname.startsWith('/plants')) return 'plantas';
  if (pathname.startsWith('/watering')) return 'riego';
  if (pathname.startsWith('/history')) return 'historial';
  if (pathname.startsWith('/settings')) return 'ajustes';
  return 'dashboard';
}

function ProtectedLayout() {
  const location = useLocation();
  const activeItem = getActiveItemFromPath(location.pathname);

  return (
    <AppShell activeItem={activeItem}>
      <Outlet />
    </AppShell>
  );
}

export const router = createBrowserRouter(
  [
    {
      path: '/login',
      element: <Login />,
    },
    {
      element: <AuthGuard />,
      children: [
        {
          element: <ProtectedLayout />,
          children: [
            { index: true, element: <Dashboard /> },
            { path: 'plants', element: <Plants /> },
            { path: 'watering', element: <Watering /> },
            { path: 'history', element: <History /> },
            { path: 'settings', element: <Settings /> },
          ],
        },
      ],
    },
  ],
  { basename: '/garden-app' },
);
