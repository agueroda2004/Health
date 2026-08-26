import { cn } from "../utils/cn";

type ProgressBarProps = {
  value: number;
  max?: number;
  className?: string;
  barClassName?: string;
};

export function ProgressBar({ value, max = 100, className, barClassName }: ProgressBarProps) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return (
    <div className={cn("h-2.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800", className)}>
      <div
        className={cn("h-full rounded-full bg-primary transition-all duration-500", barClassName)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}