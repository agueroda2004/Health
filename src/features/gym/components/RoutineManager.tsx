import { useState } from "react";
import { CalendarDays, Dumbbell, Pencil, Plus, Trash2 } from "lucide-react";
import { Card } from "../../../shared/ui/Card";
import { Button } from "../../../shared/ui/Button";
import { ConfirmDialog } from "../../../shared/ui/ConfirmDialog";
import { EmptyState } from "../../../shared/ui/EmptyState";
import { Skeleton } from "../../../shared/ui/Skeleton";
import { IconButton } from "../../../shared/ui/IconButton";
import { useTemplates, useTemplateMutations } from "../hooks/useTemplates";
import { RoutineWizard } from "./RoutineWizard";
import type { TemplateWithDays } from "../api/templates";

export function RoutineManager() {
  const { data: templates, isLoading } = useTemplates();
  const mutations = useTemplateMutations();

  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardExisting, setWizardExisting] = useState<TemplateWithDays | null>(null);
  const [wizardKey, setWizardKey] = useState(0);
  const [confirmTemplate, setConfirmTemplate] = useState<string | null>(null);

  function openWizard(existing: TemplateWithDays | null) {
    setWizardExisting(existing);
    setWizardKey((k) => k + 1);
    setWizardOpen(true);
  }

  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-extrabold text-zinc-800 dark:text-zinc-100">Rutinas</h3>
        <Button size="sm" onClick={() => openWizard(null)}>
          <Plus className="h-4 w-4" />
          Nueva
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-14" />
      ) : templates && templates.length > 0 ? (
        <div className="space-y-2">
          {templates.map((t) => (
            <div
              key={t.id}
              className="flex items-center gap-3 rounded-2xl border border-zinc-100 px-3 py-2.5 dark:border-zinc-800"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-100 text-primary-600 dark:bg-primary-900/60 dark:text-primary-300">
                <Dumbbell className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-extrabold text-zinc-800 dark:text-zinc-100">
                  {t.name}
                </p>
                <p className="text-xs font-medium text-zinc-400">{t.template_days.length} días</p>
              </div>
              <IconButton label="Editar" onClick={() => openWizard(t)} className="h-9 w-9">
                <Pencil className="h-4 w-4" />
              </IconButton>
              <IconButton
                label="Eliminar"
                onClick={() => setConfirmTemplate(t.id)}
                className="h-9 w-9 text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </IconButton>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<CalendarDays className="h-6 w-6" />}
          title="Sin rutinas"
          description="Crea tu primera rutina (PPL, Upper/Lower, Full Body…)."
          action={
            <Button size="sm" onClick={() => openWizard(null)}>
              <Plus className="h-4 w-4" />
              Crear rutina
            </Button>
          }
        />
      )}

      <RoutineWizard
        key={wizardKey}
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        existing={wizardExisting}
      />

      <ConfirmDialog
        open={confirmTemplate !== null}
        title="Eliminar rutina"
        message="¿Seguro que quieres eliminar esta rutina y todos sus días?"
        confirmLabel="Eliminar"
        tone="danger"
        onConfirm={() => {
          if (confirmTemplate) void mutations.remove.mutateAsync(confirmTemplate);
          setConfirmTemplate(null);
        }}
        onCancel={() => setConfirmTemplate(null)}
      />
    </Card>
  );
}