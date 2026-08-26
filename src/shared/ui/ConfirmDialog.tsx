import { AlertTriangle } from "lucide-react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { cn } from "../utils/cn";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "default";
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  tone = "default",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <div className="flex flex-col items-center gap-4 pt-2 text-center">
        <div
          className={cn(
            "flex h-16 w-16 items-center justify-center rounded-3xl",
            tone === "danger" ? "bg-red-50 text-red-500 dark:bg-red-950/50" : "bg-primary-100 text-primary-600 dark:bg-primary-900/50",
          )}
        >
          <AlertTriangle className="h-8 w-8" />
        </div>
        <p className="max-w-xs text-sm font-medium text-zinc-600 dark:text-zinc-300">{message}</p>
        <div className="flex w-full gap-3 pt-2">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={onCancel}
            disabled={loading}
            type="button"
          >
            {cancelLabel}
          </Button>
          <Button
            variant={tone === "danger" ? "danger" : "primary"}
            className="flex-1"
            onClick={onConfirm}
            disabled={loading}
            type="button"
          >
            {loading ? "Procesando…" : confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}