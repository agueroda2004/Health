import type { ReactNode } from "react";

type FieldProps = {
  label?: string;
  children: ReactNode;
  hint?: string;
};

export function Field({ label, children, hint }: FieldProps) {
  return (
    <label className="block space-y-1.5">
      {label && (
        <span className="block text-sm font-bold text-zinc-600 dark:text-zinc-300">{label}</span>
      )}
      {children}
      {hint && <span className="block text-xs font-medium text-zinc-400">{hint}</span>}
    </label>
  );
}