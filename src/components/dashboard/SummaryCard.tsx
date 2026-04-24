interface SummaryCardProps {
  icon: string;
  count: number;
  label: string;
  accent?: 'green' | 'amber' | 'red';
}

const ACCENT_CLASSES: Record<
  NonNullable<SummaryCardProps['accent']>,
  { card: string; count: string; iconBg: string }
> = {
  green: {
    card: 'border-garden-200 bg-linear-to-br from-white to-garden-50/80',
    count: 'text-garden-950',
    iconBg: 'bg-garden-100',
  },
  amber: {
    card: 'border-amber-200 bg-linear-to-br from-white to-amber-50/80',
    count: 'text-amber-950',
    iconBg: 'bg-amber-100',
  },
  red: {
    card: 'border-red-200 bg-linear-to-br from-white to-red-50/80',
    count: 'text-red-950',
    iconBg: 'bg-red-100',
  },
};

const DEFAULT_CLASSES = {
  card: 'border-garden-100 bg-linear-to-br from-white to-garden-50/60',
  count: 'text-garden-950',
  iconBg: 'bg-garden-50',
};

export function SummaryCard({ icon, count, label, accent }: SummaryCardProps) {
  const classes = accent ? ACCENT_CLASSES[accent] : DEFAULT_CLASSES;

  return (
    <div className={`rounded-[1.75rem] border p-5 shadow-sm ${classes.card}`}>
      <div
        aria-hidden="true"
        className={`flex h-10 w-10 items-center justify-center rounded-full text-xl ${classes.iconBg}`}
      >
        {icon}
      </div>
      <p className={`mt-3 text-3xl font-semibold ${classes.count}`}>{count}</p>
      <p className="mt-1 text-sm font-medium text-gray-600">{label}</p>
    </div>
  );
}
