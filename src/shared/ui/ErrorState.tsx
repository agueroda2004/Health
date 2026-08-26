import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "./Button";

type ErrorStateProps = {
  message?: string;
  onRetry?: () => void;
};

export function ErrorState({ message = "Algo salió mal. Inténtalo de nuevo.", onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-zinc-200 bg-white/60 px-6 py-12 text-center dark:border-zinc-700 dark:bg-zinc-900/60">
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-red-50 text-red-500 dark:bg-red-950/50">
        <AlertCircle className="h-8 w-8" />
      </div>
      <h3 className="text-lg font-extrabold text-zinc-700 dark:text-zinc-200">Ups…</h3>
      <p className="max-w-xs text-sm font-medium text-zinc-500 dark:text-zinc-400">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry} className="mt-2">
          <RefreshCw className="h-4 w-4" />
          Reintentar
        </Button>
      )}
    </div>
  );
}