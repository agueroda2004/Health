import type { ReactNode } from "react";
import { Trash2 } from "lucide-react";
import { Card } from "./Card";
import { cn } from "../utils/cn";

export type ActivityKind = "gym" | "run" | "ride";

type ActivityCardProps = {
  icon: ReactNode;
  title: string;
  subtitle?: ReactNode;
  right?: ReactNode;
  kind: ActivityKind;
  onDelete?: () => void;
  deleting?: boolean;
};

const kindColors: Record<ActivityKind, string> = {
  gym: "bg-primary-100 text-primary-600 dark:bg-primary-900/60 dark:text-primary-300",
  run: "bg-sky-100 text-sky-600 dark:bg-sky-900/60 dark:text-sky-300",
  ride: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/60 dark:text-emerald-300",
};

export function ActivityCard({
  icon,
  title,
  subtitle,
  right,
  kind,
  onDelete,
  deleting,
}: ActivityCardProps) {
  return (
    <Card
      className={cn(
        "w-full p-4 text-left",
      )}
    >
      <div className="flex w-full items-center gap-3">
        <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl", kindColors[kind])}>
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-extrabold text-zinc-800 dark:text-zinc-100">{title}</p>
          {subtitle && <p className="truncate text-sm font-medium text-zinc-400">{subtitle}</p>}
        </div>
        {right && <div className="shrink-0 text-sm font-bold text-zinc-500 dark:text-zinc-400">{right}</div>}
        {onDelete && (
          <button
            type="button"
            aria-label="Eliminar"
            disabled={deleting}
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-40 dark:bg-zinc-800 dark:hover:bg-red-950/50 dark:hover:text-red-400"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </Card>
  );
}