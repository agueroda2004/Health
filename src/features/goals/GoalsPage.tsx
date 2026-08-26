import { useState } from "react";
import { Plus, Target, Trash2 } from "lucide-react";
import { Card } from "../../shared/ui/Card";
import { Button } from "../../shared/ui/Button";
import { Input } from "../../shared/ui/Input";
import { Select } from "../../shared/ui/Select";
import { Field } from "../../shared/ui/Field";
import { Modal } from "../../shared/ui/Modal";
import { ConfirmDialog } from "../../shared/ui/ConfirmDialog";
import { ProgressBar } from "../../shared/ui/ProgressBar";
import { Skeleton } from "../../shared/ui/Skeleton";
import { EmptyState } from "../../shared/ui/EmptyState";
import { notify } from "../../shared/ui/notify";
import { useGoals, useGoalMutations } from "../goals/hooks/useGoals";
import { goalProgress } from "../../shared/utils/goals";
import DatePicker from "../../shared/ui/DatePicker";
import { todayISO, addDaysISO } from "../../shared/utils/dates";
import { useSettingsStore } from "../../shared/hooks/useSettings";
import { fromKm } from "../../shared/utils/units";
import type { GoalActivityType, GoalType } from "../../types/database";

const TYPE_UNITS: Record<GoalType, string> = {
  distance: "km",
  time: "h",
  workouts: "sesiones",
};

const TYPE_LABELS: Record<GoalType, string> = {
  distance: "Distancia",
  time: "Tiempo",
  workouts: "Entrenamientos",
};

export function GoalsPage() {
  const { data: goals, isLoading } = useGoals();
  const { create, remove } = useGoalMutations();
  const distanceUnit = useSettingsStore((s) => s.distanceUnit);

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<GoalType>("distance");
  const [activityType, setActivityType] = useState<GoalActivityType>("run");
  const [target, setTarget] = useState("");
  const [startDate, setStartDate] = useState(todayISO());
  const [endDate, setEndDate] = useState(addDaysISO(todayISO(), 30));
  const [saving, setSaving] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  async function handleCreate() {
    const t = Number(target);
    if (!name.trim() || !t || t <= 0) return;
    setSaving(true);
    try {
      await create.mutateAsync({
        name: name.trim(),
        type,
        activity_type: activityType,
        target_value: t,
        unit: TYPE_UNITS[type],
        start_date: startDate,
        end_date: endDate,
      });
      setOpen(false);
      setName("");
      setTarget("");
      notify.success("Meta creada 🎯");
    } catch {
      notify.error("No se pudo crear la meta.");
    } finally {
      setSaving(false);
    }
  }

  function formatValue(value: number, unit: string | null, goalType: GoalType): string {
    if (goalType === "workouts") return String(Math.round(value));
    if (goalType === "time") return `${value.toFixed(1)} h`;
    if (unit === "km" && distanceUnit === "miles") return `${fromKm(value, "miles").toFixed(1)} mi`;
    return `${value.toFixed(1)} ${unit ?? ""}`.trim();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-800 dark:text-zinc-100">Metas</h1>
          <p className="text-sm font-medium text-zinc-400">Objetivos con progreso real.</p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          Nueva
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-24" />
      ) : goals && goals.length > 0 ? (
        <div className="space-y-3">
          {goals.map((g) => {
            const prog = goalProgress(g.current_value, g.target_value);
            return (
              <Card key={g.id} className="p-4">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div>
                    <p className="font-extrabold text-zinc-800 dark:text-zinc-100">{g.name}</p>
                    <p className="text-xs font-medium text-zinc-400 capitalize">{g.activity_type} · {TYPE_LABELS[g.type]}</p>
                  </div>
                  <IconTrash onClick={() => setConfirmId(g.id)} />
                </div>
                <div className="mb-2 flex items-end justify-between">
                  <span className="text-xl font-extrabold text-primary">
                    {formatValue(g.current_value, g.unit, g.type)}
                  </span>
                  <span className="text-sm font-bold text-zinc-400">
                    / {formatValue(g.target_value, g.unit, g.type)}
                  </span>
                </div>
                <ProgressBar value={prog.progressPct} />
                {prog.isComplete && (
                  <p className="mt-2 text-center text-sm font-extrabold text-primary">¡Meta cumplida! 🎉</p>
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={<Target className="h-8 w-8" />}
          title="Sin metas todavía"
          description="Crea tu primera meta, por ejemplo: correr 100 km este mes."
          action={
            <Button onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4" />
              Crear meta
            </Button>
          }
        />
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Nueva meta">
        <div className="space-y-4">
          <Field label="Nombre">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Correr 100 km este mes" />
          </Field>
          <Field label="Tipo">
            <Select value={type} onChange={(v) => setType(v as GoalType)}>
              <option value="distance">Distancia</option>
              <option value="time">Tiempo</option>
              <option value="workouts">Entrenamientos</option>
            </Select>
          </Field>
          <Field label="Actividad">
            <Select value={activityType} onChange={(v) => setActivityType(v as GoalActivityType)}>
              <option value="run">Running</option>
              <option value="ride">Cycling</option>
              <option value="gym">Gimnasio</option>
              <option value="general">General</option>
            </Select>
          </Field>
          <Field label={`Objetivo (${TYPE_UNITS[type]})`}>
            <Input type="number" inputMode="decimal" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="100" />
          </Field>
          <div className="flex flex-col gap-3">
            <Field label="Inicio">
              <DatePicker value={startDate} onChange={setStartDate} />
            </Field>
            <Field label="Fin">
              <DatePicker value={endDate} onChange={setEndDate} minDate={new Date(`${startDate}T00:00:00`)} />
            </Field>
          </div>
          <Button size="lg" className="w-full" onClick={handleCreate} disabled={saving || !name.trim() || !target}>
            {saving ? "Creando…" : "Crear meta"}
          </Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmId !== null}
        title="Eliminar meta"
        message="¿Seguro que quieres eliminar esta meta?"
        confirmLabel="Eliminar"
        tone="danger"
        onConfirm={() => {
          if (confirmId) void remove.mutateAsync(confirmId);
          setConfirmId(null);
        }}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  );
}

function IconTrash({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Eliminar"
      className="flex h-9 w-9 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-500 transition hover:bg-red-50 hover:text-red-500 dark:bg-zinc-800"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}