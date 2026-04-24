interface ReminderBadgeProps {
  count: number;
}

export function ReminderBadge({ count }: ReminderBadgeProps) {
  if (count === 0) return null;

  return (
    <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
      {count}
    </span>
  );
}
