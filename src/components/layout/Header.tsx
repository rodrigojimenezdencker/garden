export function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex h-14 items-center justify-between bg-garden-700 px-4 shadow-md">
      <span className="text-lg font-bold tracking-tight text-white">
        Mi Jardín 🌱
      </span>

      <div
        aria-label="Perfil de usuario"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-garden-500 text-sm font-semibold text-white"
      >
        MJ
      </div>
    </header>
  );
}
