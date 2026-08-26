import type { ButtonHTMLAttributes } from "react";
import { cn } from "../utils/cn";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  active?: boolean;
};

export function IconButton({ label, active, className, ...props }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        "flex h-11 w-11 items-center justify-center rounded-2xl transition active:scale-95 disabled:opacity-40",
        active
          ? "bg-primary-100 text-primary-700 dark:bg-primary-900/60 dark:text-primary-300"
          : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-200",
        className,
      )}
      {...props}
    />
  );
}