import type { ReactNode } from "react";
import { cn } from "../utils/cn";

type EmptyStateProps = {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-zinc-200 bg-white/60 px-6 py-12 text-center dark:border-zinc-700 dark:bg-zinc-900/60",
        className,
      )}
    >
      <div className="flex h-16 w-16 animate-pop items-center justify-center rounded-3xl bg-primary-100 text-primary-600 dark:bg-primary-900/50 dark:text-primary-400">
        {icon}
      </div>
      <h3 className="text-lg font-extrabold text-zinc-700 dark:text-zinc-200">{title}</h3>
      {description && (
        <p className="max-w-xs text-sm font-medium text-zinc-500 dark:text-zinc-400">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}