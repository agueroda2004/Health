import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "../utils/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "soft";
type Size = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-2xl font-bold transition active:translate-y-0.5 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 select-none";

const variants: Record<Variant, string> = {
  primary:
    "bg-primary text-white shadow-[0_4px_0_0_#c2410c] hover:brightness-105 dark:shadow-[0_4px_0_0_#7c2d12]",
  soft: "bg-primary-100 text-primary-700 shadow-[0_3px_0_0_#fdba74] hover:bg-primary-200/70 dark:bg-primary-900 dark:text-primary-200 dark:shadow-[0_3px_0_0_#7c2d12]",
  secondary:
    "bg-white text-zinc-700 border-2 border-zinc-200 shadow-[0_3px_0_0_#e4e4e7] hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-200 dark:border-zinc-700 dark:shadow-[0_3px_0_0_#3f3f46] dark:hover:bg-zinc-800",
  ghost: "text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-900/30",
  danger:
    "bg-red-500 text-white shadow-[0_4px_0_0_#b91c1c] hover:brightness-105",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  ),
);

Button.displayName = "Button";