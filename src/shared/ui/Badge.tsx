import type { ReactNode } from "react";
import { cn } from "../utils/cn";

type BadgeProps = {
  children: ReactNode;
  className?: string;
};

export function Badge({ children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-primary-100 px-2.5 py-1 text-xs font-bold text-primary-700 dark:bg-primary-900/50 dark:text-primary-300",
        className,
      )}
    >
      {children}
    </span>
  );
}