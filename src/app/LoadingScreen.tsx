import { Dumbbell } from "lucide-react";

export function LoadingScreen() {
  return (
    <div className="safe-top flex min-h-dvh flex-col items-center justify-center gap-4 bg-zinc-50 dark:bg-zinc-950">
      <div className="flex h-16 w-16 animate-pop items-center justify-center rounded-3xl bg-primary text-white">
        <Dumbbell className="h-8 w-8" />
      </div>
      <p className="text-sm font-bold text-zinc-400">Cargando…</p>
    </div>
  );
}