import type { ReactNode } from "react";
import { Card } from "./Card";
import { cn } from "../utils/cn";

type StatCardProps = {
  icon?: ReactNode;
  label: string;
  value: ReactNode;
  sub?: string;
  accent?: boolean;
  className?: string;
};

export function StatCard({ icon, label, value, sub, accent, className }: StatCardProps) {
  return (
    <Card
      className={cn(
        accent &&
          "border-primary-200 bg-primary-50/60 dark:border-primary-800/60 dark:bg-primary-950/30",
        className,
      )}
    >
      <div className="flex items-center gap-3 p-4">
        {icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-primary-600 dark:bg-primary-900/60 dark:text-primary-300">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate text-xs font-bold uppercase tracking-wide text-zinc-400">{label}</p>
          <p className="truncate text-xl font-extrabold text-zinc-800 dark:text-zinc-100">{value}</p>
          {sub && <p className="truncate text-xs font-medium text-zinc-400">{sub}</p>}
        </div>
      </div>
    </Card>
  );
}