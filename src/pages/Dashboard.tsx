import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { WeatherWidget } from '../components/WeatherWidget';
import { RecentActivity } from '../components/dashboard/RecentActivity';
import { SummaryCard } from '../components/dashboard/SummaryCard';
import { Button } from '../components/ui/Button';
import { useCareHistory } from '../hooks/useCareHistory';
import { usePlants } from '../hooks/usePlants';
import { useWatering } from '../hooks/useWatering';

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Buenos días';
  if (hour >= 12 && hour < 20) return 'Buenas tardes';
  return 'Buenas noches';
}

export function Dashboard() {
  const { plants, loading: loadingPlants } = usePlants();
  const { schedules, loading: loadingWatering, logWatering } = useWatering();
  const { events, loading: loadingHistory } = useCareHistory();

  const [loggingPlantId, setLoggingPlantId] = useState<string | null>(null);
  const [successPlantId, setSuccessPlantId] = useState<string | null>(null);

  const loading = loadingPlants || loadingWatering || loadingHistory;

  const pendingToday = useMemo(
    () =>
      schedules.filter(
        (s) => s.isOverdue || s.daysUntilNext === 0 || s.lastWateredAt === null,
      ),
    [schedules],
  );

  const overdueCount = useMemo(
    () => schedules.filter((s) => s.isOverdue).length,
    [schedules],
  );

  const careThisWeekCount = useMemo(() => {
    const sevenDaysAgo = new Date(Date.now() - 7 * MS_PER_DAY);
    return events.filter((e) => e.date >= sevenDaysAgo).length;
  }, [events]);

  const recentEvents = useMemo(() => events.slice(0, 5), [events]);

  const handleLogWatering = async (plantId: string) => {
    setLoggingPlantId(plantId);
    try {
      await logWatering(plantId);
      setSuccessPlantId(plantId);
      window.setTimeout(() => {
        setSuccessPlantId((current) => (current === plantId ? null : current));
      }, 1800);
    } finally {
      setLoggingPlantId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8">
        <div className="rounded-[2rem] border border-garden-100 bg-white/85 p-8 text-center text-garden-700 shadow-sm backdrop-blur-sm">
          Preparando tu jardín...
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-full bg-[radial-gradient(circle_at_top_left,_rgba(116,198,157,0.15),_transparent_40%),radial-gradient(circle_at_bottom_right,_rgba(235,87,87,0.08),_transparent_35%)] p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-[2rem] border border-garden-100 bg-white/88 p-6 shadow-sm backdrop-blur-sm md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-garden-500">
            Vista general
          </p>
          <h1 className="mt-2 text-4xl font-semibold text-garden-950">
            Mi Jardín
          </h1>
          <p className="mt-1 text-base text-gray-500">{getGreeting()}</p>
        </section>

        <section aria-label="Resumen">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              count={plants.length}
              icon="🌿"
              label="Total plantas"
            />
            <SummaryCard
              accent="amber"
              count={pendingToday.length}
              icon="💧"
              label="Pendientes hoy"
            />
            <SummaryCard
              accent="red"
              count={overdueCount}
              icon="⏰"
              label="Atrasadas"
            />
            <SummaryCard
              accent="green"
              count={careThisWeekCount}
              icon="✅"
              label="Cuidados esta semana"
            />
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-garden-950">
              Pendientes hoy
            </h2>

            {pendingToday.length === 0 ? (
              <div className="rounded-[2rem] border border-dashed border-garden-200 bg-white/80 p-8 text-center shadow-sm backdrop-blur-sm">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-garden-100 text-3xl">
                  💧
                </div>
                <p className="mt-4 text-sm text-garden-700">
                  ¡Todo al día! No hay riegos pendientes.
                </p>
              </div>
            ) : (
              <ul className="space-y-3">
                {pendingToday.map((schedule) => {
                  const badgeLabel = schedule.isOverdue
                    ? 'Atrasada'
                    : schedule.lastWateredAt === null
                      ? 'Nunca regada'
                      : 'Hoy';

                  const badgeClass = schedule.isOverdue
                    ? 'bg-red-100 text-red-700'
                    : schedule.lastWateredAt === null
                      ? 'bg-garden-100 text-garden-700'
                      : 'bg-amber-100 text-amber-800';

                  const cardClass = schedule.isOverdue
                    ? 'border-red-200 bg-linear-to-br from-white to-red-50/80'
                    : schedule.lastWateredAt === null
                      ? 'border-garden-200 bg-linear-to-br from-white to-garden-50/80'
                      : 'border-amber-200 bg-linear-to-br from-white to-amber-50/80';

                  return (
                    <li
                      className={`flex items-center justify-between gap-4 rounded-[1.75rem] border p-4 shadow-sm ${cardClass}`}
                      key={schedule.plantId}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium text-garden-950">
                            {schedule.plantName}
                          </span>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${badgeClass}`}
                          >
                            {badgeLabel}
                          </span>
                        </div>
                        {successPlantId === schedule.plantId ? (
                          <p className="mt-1 text-xs font-medium text-garden-700">
                            ¡Riego guardado! 🎉
                          </p>
                        ) : null}
                      </div>
                      <Button
                        loading={loggingPlantId === schedule.plantId}
                        onClick={() => handleLogWatering(schedule.plantId)}
                        size="sm"
                        variant="primary"
                      >
                        Regar
                      </Button>
                    </li>
                  );
                })}
              </ul>
            )}

            {plants.length === 0 ? (
              <Link
                className="inline-flex rounded-full bg-garden-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-garden-700"
                to="/plants"
              >
                Añadir plantas
              </Link>
            ) : null}
          </section>

          <div className="space-y-6">
            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-garden-950">
                Actividad reciente
              </h2>
              <RecentActivity events={recentEvents} plants={plants} />
            </section>

            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-garden-950">Clima</h2>
              <WeatherWidget />
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
