import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlantCard } from '../components/plant/PlantCard';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { usePlants } from '../hooks/usePlants';

type ViewMode = 'grid' | 'list';

export function Plants() {
  const navigate = useNavigate();
  const { plants, loading } = usePlants();
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const filteredPlants = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) {
      return plants;
    }

    return plants.filter((plant) => {
      return (
        plant.name.toLowerCase().includes(query) ||
        plant.species.toLowerCase().includes(query)
      );
    });
  }, [plants, search]);

  return (
    <div className="relative min-h-full bg-[radial-gradient(circle_at_top,_rgba(116,198,157,0.18),_transparent_45%)] p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-garden-500">
              Catálogo vivo
            </p>
            <div className="mt-2 flex items-center gap-3">
              <h1 className="text-3xl font-semibold text-garden-950">
                Mis Plantas
              </h1>
              <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-garden-700 shadow-sm ring-1 ring-garden-100">
                {plants.length}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start rounded-full bg-white p-1 shadow-sm ring-1 ring-garden-100">
            <button
              className={[
                'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                viewMode === 'grid'
                  ? 'bg-garden-600 text-white'
                  : 'text-garden-700 hover:bg-garden-50',
              ].join(' ')}
              onClick={() => setViewMode('grid')}
              type="button"
            >
              Cuadrícula
            </button>
            <button
              className={[
                'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                viewMode === 'list'
                  ? 'bg-garden-600 text-white'
                  : 'text-garden-700 hover:bg-garden-50',
              ].join(' ')}
              onClick={() => setViewMode('list')}
              type="button"
            >
              Lista
            </button>
          </div>
        </div>

        <div className="rounded-[2rem] border border-garden-100 bg-white/80 p-4 shadow-sm backdrop-blur-sm">
          <Input
            id="plants-search"
            label="Buscar"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Busca por nombre o especie"
            value={search}
          />
        </div>

        {loading ? (
          <div className="rounded-[2rem] border border-garden-100 bg-white/80 p-8 text-center text-garden-700 shadow-sm backdrop-blur-sm">
            Cargando plantas...
          </div>
        ) : plants.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-garden-200 bg-white/80 p-10 text-center shadow-sm backdrop-blur-sm">
            <div className="mx-auto flex h-18 w-18 items-center justify-center rounded-full bg-garden-100 text-4xl">
              🌱
            </div>
            <h2 className="mt-5 text-2xl font-semibold text-garden-950">
              No tienes plantas todavía. ¡Añade tu primera planta! 🌱
            </h2>
          </div>
        ) : filteredPlants.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-garden-200 bg-white/80 p-10 text-center shadow-sm backdrop-blur-sm">
            <h2 className="text-xl font-semibold text-garden-950">
              No encontramos resultados para tu búsqueda
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Prueba con otro nombre o una especie distinta.
            </p>
          </div>
        ) : (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4'
                : 'space-y-4'
            }
          >
            {filteredPlants.map((plant) => (
              <PlantCard key={plant.id} plant={plant} view={viewMode} />
            ))}
          </div>
        )}
      </div>

      <Button
        aria-label="Añadir planta"
        className="fixed bottom-20 right-4 h-14 w-14 rounded-full text-3xl shadow-lg md:bottom-8 md:right-8"
        onClick={() => navigate('/plants/new')}
      >
        +
      </Button>
    </div>
  );
}
