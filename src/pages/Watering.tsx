import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useWatering } from '../hooks/useWatering';

const titleDateFormatter = new Intl.DateTimeFormat('es-ES', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});

const fullDateFormatter = new Intl.DateTimeFormat('es-ES', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const capitalize = (value: string) => {
  return value.charAt(0).toUpperCase() + value.slice(1);
};

const getRelativeWateringLabel = (date: Date | null) => {
  if (!date) {
    return 'Nunca regada';
  }

  const today = new Date();
  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  ).getTime();
  const targetStart = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ).getTime();
  const diffDays = Math.round(
    (todayStart - targetStart) / (1000 * 60 * 60 * 24),
  );

  if (diffDays <= 0) {
    return 'Hoy';
  }

  if (diffDays === 1) {
    return 'Hace 1 día';
  }

  return `Hace ${diffDays} días`;
};

const getSchedulePriority = ({
  isOverdue,
  daysUntilNext,
  lastWateredAt,
}: {
  isOverdue: boolean;
  daysUntilNext: number | null;
  lastWateredAt: Date | null;
}) => {
  if (isOverdue) {
    return 0;
  }

  if (daysUntilNext === 0) {
    return 1;
  }

  if (!lastWateredAt) {
    return 2;
  }

  return 3;
};

const sortSchedules = <
  T extends {
    isOverdue: boolean;
    daysUntilNext: number | null;
    lastWateredAt: Date | null;
    plantName: string;
  },
>(
  items: T[],
) => {
  return [...items].sort((left, right) => {
    const priorityDifference =
      getSchedulePriority(left) - getSchedulePriority(right);

    if (priorityDifference !== 0) {
      return priorityDifference;
    }

    const leftDays = left.daysUntilNext ?? Number.POSITIVE_INFINITY;
    const rightDays = right.daysUntilNext ?? Number.POSITIVE_INFINITY;

    if (leftDays !== rightDays) {
      return leftDays - rightDays;
    }

    return left.plantName.localeCompare(right.plantName, 'es');
  });
};

function WateringScheduleSection({
  title,
  schedules,
  loggingPlantId,
  successPlantId,
  onLogWatering,
}: {
  title: string;
  schedules: ReturnType<typeof useWatering>['schedules'];
  loggingPlantId: string | null;
  successPlantId: string | null;
  onLogWatering: (plantId: string) => Promise<void>;
}) {
  if (schedules.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold text-garden-950">{title}</h2>
      <div className="grid gap-4 xl:grid-cols-2">
        {sortSchedules(schedules).map((schedule) => {
          const badgeClassName =
            schedule.lastWateredAt === null
              ? 'bg-garden-100 text-garden-800'
              : schedule.isOverdue
                ? 'bg-red-100 text-red-700'
                : schedule.daysUntilNext === 0
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-emerald-100 text-emerald-800';
          const cardClassName =
            schedule.lastWateredAt === null
              ? 'border-garden-200 bg-linear-to-br from-white to-garden-50/80'
              : schedule.isOverdue
                ? 'border-red-200 bg-linear-to-br from-white to-red-50/80'
                : schedule.daysUntilNext === 0
                  ? 'border-amber-200 bg-linear-to-br from-white to-amber-50/80'
                  : 'border-emerald-200 bg-linear-to-br from-white to-emerald-50/80';
          const badgeLabel =
            schedule.lastWateredAt === null
              ? 'Nunca regada'
              : schedule.isOverdue
                ? 'Atrasada'
                : schedule.daysUntilNext === 0
                  ? 'Hoy'
                  : `En ${schedule.daysUntilNext} día${schedule.daysUntilNext === 1 ? '' : 's'}`;

          return (
            <Card
              className={`rounded-[2rem] border p-5 shadow-sm ${cardClassName}`}
              key={schedule.plantId}
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-2xl font-semibold text-garden-950">
                      {schedule.plantName}
                    </h3>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${badgeClassName}`}
                    >
                      {badgeLabel}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-gray-700">
                    <p>
                      <span className="font-medium text-garden-900">
                        Último riego:{' '}
                      </span>
                      {schedule.lastWateredAt === null
                        ? 'Nunca regada — regar pronto'
                        : getRelativeWateringLabel(schedule.lastWateredAt)}
                    </p>
                    <p>
                      <span className="font-medium text-garden-900">
                        Próximo riego:{' '}
                      </span>
                      {schedule.nextWateringDate
                        ? fullDateFormatter.format(schedule.nextWateringDate)
                        : 'Aún sin fecha calculada'}
                    </p>
                    <p>
                      <span className="font-medium text-garden-900">
                        Ritmo:{' '}
                      </span>
                      Cada {schedule.frequencyDays} día
                      {schedule.frequencyDays === 1 ? '' : 's'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-start gap-2 md:items-end">
                  <Button
                    loading={loggingPlantId === schedule.plantId}
                    onClick={() => onLogWatering(schedule.plantId)}
                  >
                    Regar ahora
                  </Button>
                  {successPlantId === schedule.plantId ? (
                    <p className="text-sm font-medium text-garden-700">
                      ¡Riego guardado!
                    </p>
                  ) : null}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

export function Watering() {
  const { loading, logWatering, schedules, dueToday, dueThisWeek } =
    useWatering();
  const [loggingPlantId, setLoggingPlantId] = useState<string | null>(null);
  const [successPlantId, setSuccessPlantId] = useState<string | null>(null);

  const pendingTodayCount = dueToday.length;
  const overdueCount = schedules.filter(
    (schedule) => schedule.isOverdue,
  ).length;

  const handleLogWatering = async (plantId: string) => {
    setLoggingPlantId(plantId);

    try {
      await logWatering(plantId);
      setSuccessPlantId(plantId);
      window.setTimeout(() => {
        setSuccessPlantId((currentPlantId) =>
          currentPlantId === plantId ? null : currentPlantId,
        );
      }, 1800);
    } finally {
      setLoggingPlantId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8">
        <div className="rounded-[2rem] border border-garden-100 bg-white/85 p-8 text-center text-garden-700 shadow-sm backdrop-blur-sm">
          Preparando tu agenda de riego...
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-full bg-[radial-gradient(circle_at_top,_rgba(235,87,87,0.12),_transparent_38%),radial-gradient(circle_at_bottom_right,_rgba(116,198,157,0.18),_transparent_32%)] p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-[2rem] border border-garden-100 bg-white/88 p-6 shadow-sm backdrop-blur-sm md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-garden-500">
            Rutina viva
          </p>
          <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-4xl font-semibold text-garden-950">Riego</h1>
              <p className="mt-2 text-base text-gray-600">
                {capitalize(titleDateFormatter.format(new Date()))}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Card className="border border-amber-200 bg-amber-50/90 p-4 shadow-none">
                <p className="text-sm font-medium text-amber-900">
                  Pendientes hoy
                </p>
                <p className="mt-2 text-3xl font-semibold text-amber-950">
                  {pendingTodayCount}
                </p>
              </Card>
              <Card className="border border-red-200 bg-red-50/90 p-4 shadow-none">
                <p className="text-sm font-medium text-red-900">Atrasadas</p>
                <p className="mt-2 text-3xl font-semibold text-red-950">
                  {overdueCount}
                </p>
              </Card>
            </div>
          </div>
        </section>

        {schedules.length === 0 ? (
          <section className="rounded-[2rem] border border-dashed border-garden-200 bg-white/85 p-10 text-center shadow-sm backdrop-blur-sm">
            <div className="mx-auto flex h-18 w-18 items-center justify-center rounded-full bg-garden-100 text-4xl">
              💧
            </div>
            <h2 className="mt-5 text-2xl font-semibold text-garden-950">
              No tienes plantas registradas. ¡Añade algunas para empezar!
            </h2>
            <Link
              className="mt-6 inline-flex rounded-full bg-garden-600 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-garden-700"
              to="/plants"
            >
              Ir a mis plantas
            </Link>
          </section>
        ) : (
          <div className="space-y-8">
            <WateringScheduleSection
              loggingPlantId={loggingPlantId}
              onLogWatering={handleLogWatering}
              schedules={dueToday}
              successPlantId={successPlantId}
              title="Hoy"
            />
            <WateringScheduleSection
              loggingPlantId={loggingPlantId}
              onLogWatering={handleLogWatering}
              schedules={dueThisWeek}
              successPlantId={successPlantId}
              title="Esta semana"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default Watering;
