import { Outlet, NavLink } from "react-router-dom";
import { Dumbbell, Plus } from "lucide-react";
import { BottomNavigation } from "./BottomNavigation";
import { NAV_ITEMS } from "./navItems";
import { cn } from "../shared/utils/cn";
import { AddActivityModal } from "../features/activities/AddActivityModal";
import { useAddActivityStore } from "../features/activities/useAddActivityStore";

export function AppLayout() {
  const openAddActivity = useAddActivityStore((s) => s.open);

  return (
    <div className="min-h-dvh">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-zinc-200 bg-white px-4 py-6 dark:border-zinc-800 dark:bg-zinc-900 md:flex">
        <div className="mb-8 flex items-center gap-2 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-white">
            <Dumbbell className="h-6 w-6" strokeWidth={2.5} />
          </div>
          <span className="text-lg font-extrabold text-zinc-800 dark:text-zinc-100">Fitness</span>
        </div>
        <nav aria-label="Navegación principal" className="flex flex-1 flex-col gap-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-bold transition",
                  isActive
                    ? "bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300"
                    : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200",
                )
              }
            >
              <Icon className="h-5 w-5" />
              {label}
            </NavLink>
          ))}
        </nav>
        <p className="px-2 text-xs font-medium text-zinc-400">Fitness · V1</p>
      </aside>

      <main className="pb-28 pt-[max(1.25rem,env(safe-area-inset-top))] md:pb-12 md:pl-60">
        <div className="mx-auto w-full max-w-xl px-4 md:max-w-3xl md:px-8">
          <Outlet />
        </div>
      </main>

      <BottomNavigation />

      <button
        type="button"
        onClick={() => openAddActivity("run")}
        aria-label="Registrar actividad"
        className="fixed bottom-24 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white shadow-[0_5px_0_0_#c2410c] transition active:translate-y-0.5 md:hidden"
      >
        <Plus className="h-7 w-7" strokeWidth={3} />
      </button>

      <AddActivityModal />
    </div>
  );
}