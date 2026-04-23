import {
  Outlet,
  createBrowserRouter,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';
import { AuthGuard } from './components/AuthGuard';
import { AppShell } from './components/layout/AppShell';
import { PlantDetail } from './components/plant/PlantDetail';
import { PlantForm } from './components/plant/PlantForm';
import { usePlants } from './hooks/usePlants';
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

function NewPlantRoute() {
  const navigate = useNavigate();

  return (
    <div className="p-4 md:p-8">
      <PlantForm
        onCancel={() => navigate('/plants')}
        onSave={() => navigate('/plants')}
      />
    </div>
  );
}

function EditPlantRoute() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getPlant, loading } = usePlants();
  const plant = id ? getPlant(id) : undefined;

  if (loading) {
    return <div className="p-4 text-garden-700 md:p-8">Cargando planta...</div>;
  }

  if (!plant) {
    return (
      <div className="p-4 md:p-8">
        <p className="text-garden-700">No encontramos esa planta.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <PlantForm
        onCancel={() => navigate(`/plants/${plant.id}`)}
        onSave={() => navigate(`/plants/${plant.id}`)}
        plant={plant}
      />
    </div>
  );
}

function PlantDetailRoute() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { deletePlant, getPlant, loading } = usePlants();
  const plant = id ? getPlant(id) : undefined;

  if (loading) {
    return <div className="p-4 text-garden-700 md:p-8">Cargando planta...</div>;
  }

  if (!plant) {
    return (
      <div className="p-4 md:p-8">
        <p className="text-garden-700">No encontramos esa planta.</p>
      </div>
    );
  }

  return (
    <PlantDetail
      onBack={() => navigate('/plants')}
      onDelete={async () => {
        await deletePlant(plant.id);
        navigate('/plants');
      }}
      onEdit={() => navigate(`/plants/${plant.id}/edit`)}
      plant={plant}
    />
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
            { path: 'plants/new', element: <NewPlantRoute /> },
            { path: 'plants/:id', element: <PlantDetailRoute /> },
            { path: 'plants/:id/edit', element: <EditPlantRoute /> },
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
