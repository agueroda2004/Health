import { NavLink } from "react-router-dom";
import { cn } from "../shared/utils/cn";
import { NAV_ITEMS } from "./navItems";

export function BottomNavigation() {
  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95 md:hidden"
    >
      <div className="mx-auto grid max-w-lg grid-cols-5">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end, primary }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-0.5 py-2 text-[11px] font-bold transition",
                isActive ? "text-primary" : "text-zinc-400",
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    "flex h-8 w-12 items-center justify-center rounded-2xl transition",
                    primary
                      ? isActive
                        ? "bg-primary-100"
                        : "bg-zinc-100"
                      : isActive && "bg-primary-100",
                  )}
                >
                  <Icon className={cn("h-5 w-5", primary && "h-5 w-5")} />
                </span>
                {label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}