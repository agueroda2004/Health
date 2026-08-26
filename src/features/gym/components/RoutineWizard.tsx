import { useState } from "react";
import { Check, ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { Modal } from "../../../shared/ui/Modal";
import { Button } from "../../../shared/ui/Button";
import { Input, Textarea } from "../../../shared/ui/Input";
import { Select } from "../../../shared/ui/Select";
import { Field } from "../../../shared/ui/Field";
import { IconButton } from "../../../shared/ui/IconButton";
import { ConfirmDialog } from "../../../shared/ui/ConfirmDialog";
import { notify } from "../../../shared/ui/notify";
import { useTemplates, useTemplateMutations } from "../hooks/useTemplates";
import { useExercises } from "../hooks/useExercises";
import type { TemplateWithDays } from "../api/templates";
import { WEEKDAY_NAMES_SHORT, WEEKDAY_NAMES } from "../../../shared/utils/dates";
import { cn } from "../../../shared/utils/cn";

type RoutineWizardProps = {
  open: boolean;
  onClose: () => void;
  existing?: TemplateWithDays | null;
};

export function RoutineWizard({ open, onClose, existing }: RoutineWizardProps) {
  const { data: templates } = useTemplates();
  const { data: exercises } = useExercises();
  const mutations = useTemplateMutations();

  const [step, setStep] = useState<1 | 2 | 3>(existing ? 2 : 1);
  const [name, setName] = useState(existing?.name ?? "");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [templateId, setTemplateId] = useState<string | null>(existing?.id ?? null);
  const [creating, setCreating] = useState(false);

  const [newDayName, setNewDayName] = useState("");
  const [newDayWeekday, setNewDayWeekday] = useState<number | null>(null);
  const [addingDay, setAddingDay] = useState(false);

  const [activeDayId, setActiveDayId] = useState<string | null>(
    existing?.template_days[0]?.id ?? null,
  );
  const [addingExercise, setAddingExercise] = useState(false);
  const [newExExercise, setNewExExercise] = useState("");
  const [newExSets, setNewExSets] = useState("");
  const [newExReps, setNewExReps] = useState("");
  const [newExRest, setNewExRest] = useState("");
  const [savingExercise, setSavingExercise] = useState(false);

  const [confirmDay, setConfirmDay] = useState<string | null>(null);
  const [confirmEx, setConfirmEx] = useState<string | null>(null);

  const template = templates?.find((t) => t.id === templateId) ?? existing ?? null;
  const days = template?.template_days ?? [];
  const activeDay = days.find((d) => d.id === activeDayId) ?? days[0] ?? null;

  const takenWeekdays = new Set(
    days.map((d) => d.day_of_week).filter((w): w is number => w !== null),
  );

  async function handleNext1() {
    if (!name.trim()) return;
    setCreating(true);
    try {
      const created = await mutations.create.mutateAsync({
        name: name.trim(),
        description: description.trim() || null,
      });
      setTemplateId(created.id);
      setStep(2);
      notify.success("Rutina creada. Ahora añade tus días.");
    } catch {
      notify.error("No se pudo crear la rutina.");
    } finally {
      setCreating(false);
    }
  }

  async function handleAddDay() {
    if (!templateId || !newDayName.trim()) return;
    setAddingDay(true);
    try {
      await mutations.addDay.mutateAsync({
        template_id: templateId,
        name: newDayName.trim(),
        day_order: days.length,
        day_of_week: newDayWeekday,
      });
      setNewDayName("");
      setNewDayWeekday(null);
      notify.success("Día añadido");
    } catch {
      notify.error("No se pudo añadir el día.");
    } finally {
      setAddingDay(false);
    }
  }

  async function handleSetWeekday(dayId: string, dayOfWeek: number | null) {
    try {
      await mutations.editDay.mutateAsync({ id: dayId, input: { day_of_week: dayOfWeek } });
    } catch {
      notify.error("No se pudo actualizar el día.");
    }
  }

  async function handleAddExercise(dayId: string) {
    if (!newExExercise || !newExSets) return;
    setSavingExercise(true);
    try {
      const order = days.find((d) => d.id === dayId)?.template_exercises.length ?? 0;
      await mutations.addExercise.mutateAsync({
        template_day_id: dayId,
        exercise_id: newExExercise,
        exercise_order: order,
        target_sets: Number(newExSets) || null,
        target_reps: newExReps.trim() || null,
        rest_seconds: newExRest.trim() ? Number(newExRest) : null,
      });
      setAddingExercise(false);
      setNewExExercise("");
      setNewExSets("");
      setNewExReps("");
      setNewExRest("");
      notify.success("Ejercicio añadido");
    } catch {
      notify.error("No se pudo añadir el ejercicio.");
    } finally {
      setSavingExercise(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={existing ? "Editar rutina" : "Nueva rutina"}
    >
      <div className="space-y-4">
        <div className="flex gap-1.5">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className={cn(
                "h-1.5 flex-1 rounded-full transition",
                step >= n ? "bg-primary" : "bg-zinc-200 dark:bg-zinc-700",
              )}
            />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-extrabold text-zinc-800 dark:text-zinc-100">
                ¿Cómo se llama tu rutina?
              </h3>
              <p className="text-sm font-medium text-zinc-400">
                Ej: Push / Pull / Legs, Upper/Lower, Full Body.
              </p>
            </div>
            <Field label="Nombre">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Push / Pull / Legs"
                autoFocus
              />
            </Field>
            <Field label="Descripción (opcional)">
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Fuerza, hipertrofia…"
              />
            </Field>
            <Button size="lg" className="w-full" onClick={handleNext1} disabled={creating || !name.trim()}>
              {creating ? "Creando…" : "Siguiente"}
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-extrabold text-zinc-800 dark:text-zinc-100">
                Añade los días de entrenamiento
              </h3>
              <p className="text-sm font-medium text-zinc-400">
                Cada día es un entrenamiento. Asígnalo a un día de la semana y se mostrará cuando toque.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={newDayName}
                  onChange={(e) => setNewDayName(e.target.value)}
                  placeholder="Nombre del día (Push)"
                />
                <Button
                  onClick={() => void handleAddDay()}
                  disabled={addingDay || !newDayName.trim() || !templateId}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-col gap-2 rounded-2xl bg-zinc-50 px-3 py-2 dark:bg-zinc-800 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-xs font-bold uppercase tracking-wide text-zinc-400">
                  Día de la semana
                </span>
                <div className="flex flex-col gap-1 sm:flex-row sm:gap-1">
                  <button
                    type="button"
                    onClick={() => setNewDayWeekday(null)}
                    className={cn(
                      "flex h-8 w-full items-center justify-center rounded-lg text-xs font-bold transition sm:w-8",
                      newDayWeekday === null
                        ? "bg-primary text-white"
                        : "bg-white text-zinc-500 hover:text-zinc-700 dark:bg-zinc-900 dark:text-zinc-400",
                    )}
                    title="Sin asignar"
                  >
                    –
                  </button>
                  {WEEKDAY_NAMES_SHORT.map((label, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setNewDayWeekday(i)}
                      disabled={takenWeekdays.has(i)}
                      className={cn(
                        "flex h-8 w-full items-center justify-center rounded-lg text-xs font-bold transition sm:w-8",
                        newDayWeekday === i
                          ? "bg-primary text-white"
                          : "bg-white text-zinc-500 hover:text-zinc-700 disabled:cursor-not-allowed disabled:opacity-30 dark:bg-zinc-900 dark:text-zinc-400",
                      )}
                      title={WEEKDAY_NAMES[i]}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {days.length > 0 ? (
              <div className="space-y-2">
                {days.map((day) => (
                  <div
                    key={day.id}
                    className="flex items-center gap-3 rounded-2xl border border-zinc-100 px-3 py-2.5 dark:border-zinc-800"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-600 dark:bg-primary-900/60 dark:text-primary-300">
                      <Check className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-extrabold text-zinc-800 dark:text-zinc-100">
                        {day.name}
                      </p>
                      <p className="text-xs font-medium text-zinc-400">
                        {day.day_of_week != null ? WEEKDAY_NAMES[day.day_of_week] : "Sin día asignado"}
                      </p>
                    </div>
                    <Select
                      value={day.day_of_week == null ? "" : String(day.day_of_week)}
                      onChange={(v) =>
                        void handleSetWeekday(day.id, v === "" ? null : Number(v))
                      }
                      className="w-40"
                      aria-label="Día de la semana"
                    >
                      <option value="">Sin asignar</option>
                      {WEEKDAY_NAMES.map((label, i) => (
                        <option
                          key={i}
                          value={i}
                          disabled={takenWeekdays.has(i) && day.day_of_week !== i}
                        >
                          {label}
                        </option>
                      ))}
                    </Select>
                    <IconButton
                      label="Eliminar día"
                      onClick={() => setConfirmDay(day.id)}
                      className="h-9 w-9 text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </IconButton>
                  </div>
                ))}
              </div>
            ) : (
              <p className="rounded-2xl border-2 border-dashed border-zinc-200 px-4 py-6 text-center text-sm font-medium text-zinc-400 dark:border-zinc-700">
                Aún no hay días. Añade el primero arriba 👆
              </p>
            )}

            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={() => setStep(1)}>
                <ChevronLeft className="h-5 w-5" />
                Atrás
              </Button>
              <Button className="flex-1" onClick={() => setStep(3)} disabled={days.length === 0}>
                Siguiente
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-extrabold text-zinc-800 dark:text-zinc-100">
                Añade los ejercicios de cada día
              </h3>
              <p className="text-sm font-medium text-zinc-400">
                Elige un día y añade sus ejercicios con series y repeticiones.
              </p>
            </div>

            {days.length > 0 ? (
              <>
                <div className="flex gap-1.5 overflow-x-auto pb-1">
                  {days.map((day) => (
                    <button
                      key={day.id}
                      type="button"
                      onClick={() => {
                        setActiveDayId(day.id);
                        setAddingExercise(false);
                      }}
                      className={cn(
                        "whitespace-nowrap rounded-xl px-3 py-2 text-sm font-bold transition",
                        activeDay?.id === day.id
                          ? "bg-primary text-white"
                          : "bg-zinc-100 text-zinc-500 hover:text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400",
                      )}
                    >
                      {day.name}
                    </button>
                  ))}
                </div>

                {activeDay && (
                  <div className="rounded-2xl border border-zinc-100 p-3 dark:border-zinc-800">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="font-extrabold text-zinc-800 dark:text-zinc-100">
                        {activeDay.name}
                      </p>
                      <IconButton
                        label="Eliminar día"
                        onClick={() => setConfirmDay(activeDay.id)}
                        className="h-8 w-8 text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </IconButton>
                    </div>

                    {activeDay.template_exercises.length > 0 ? (
                      <div className="space-y-1.5">
                        {activeDay.template_exercises.map((ex) => (
                          <div
                            key={ex.id}
                            className="flex items-center gap-2 rounded-xl bg-zinc-50 px-3 py-2 dark:bg-zinc-800"
                          >
                            <div className="flex-1 text-sm font-bold text-zinc-600 dark:text-zinc-300">
                              {ex.exercise?.name ?? "Ejercicio"}
                              {ex.target_sets ? ` · ${ex.target_sets}s` : ""}
                              {ex.target_reps ? ` × ${ex.target_reps}` : ""}
                              {ex.rest_seconds ? ` · ${ex.rest_seconds}s` : ""}
                            </div>
                            <IconButton
                              label="Eliminar ejercicio"
                              onClick={() => setConfirmEx(ex.id)}
                              className="h-8 w-8 text-red-500"
                            >
                              <Trash2 className="h-4 w-4" />
                            </IconButton>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mb-2 rounded-xl border-2 border-dashed border-zinc-200 px-4 py-5 text-center text-sm font-medium text-zinc-400 dark:border-zinc-700">
                        Este día no tiene ejercicios todavía.
                      </p>
                    )}

                    {addingExercise ? (
                      <div className="mt-2 space-y-2 rounded-xl bg-primary-50 p-3 dark:bg-primary-950/20">
                        <Field label="Ejercicio">
                          <Select value={newExExercise} onChange={(v) => setNewExExercise(v)}>
                            <option value="">Selecciona…</option>
                            {exercises?.map((ex) => (
                              <option key={ex.id} value={ex.id}>
                                {ex.name}
                              </option>
                            ))}
                          </Select>
                        </Field>
                        <div className="grid grid-cols-3 gap-2">
                          <Field label="Sets">
                            <Input type="number" inputMode="numeric" value={newExSets} onChange={(e) => setNewExSets(e.target.value)} placeholder="3" />
                          </Field>
                          <Field label="Reps">
                            <Input value={newExReps} onChange={(e) => setNewExReps(e.target.value)} placeholder="8-10" />
                          </Field>
                          <Field label="Descanso (s)">
                            <Input type="number" inputMode="numeric" value={newExRest} onChange={(e) => setNewExRest(e.target.value)} placeholder="90" />
                          </Field>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            className="flex-1"
                            onClick={() => setAddingExercise(false)}
                          >
                            Cancelar
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={() => void handleAddExercise(activeDay.id)}
                            disabled={savingExercise || !newExExercise || !newExSets}
                          >
                            Añadir
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        className="mt-2 w-full"
                        onClick={() => {
                          setAddingExercise(true);
                          setNewExExercise("");
                          setNewExSets("");
                          setNewExReps("");
                          setNewExRest("");
                        }}
                      >
                        <Plus className="h-4 w-4" />
                        Añadir ejercicio
                      </Button>
                    )}
                  </div>
                )}
              </>
            ) : (
              <p className="rounded-2xl border-2 border-dashed border-zinc-200 px-4 py-6 text-center text-sm font-medium text-zinc-400 dark:border-zinc-700">
                Primero añade al menos un día en el paso anterior.
              </p>
            )}

            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={() => setStep(2)}>
                <ChevronLeft className="h-5 w-5" />
                Atrás
              </Button>
              <Button className="flex-1" onClick={onClose}>
                <Check className="h-5 w-5" />
                Finalizar
              </Button>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmDay !== null}
        title="Eliminar día"
        message="¿Seguro que quieres eliminar este día de la rutina?"
        confirmLabel="Eliminar"
        tone="danger"
        onConfirm={() => {
          if (confirmDay) void mutations.removeDay.mutateAsync(confirmDay);
          setConfirmDay(null);
        }}
        onCancel={() => setConfirmDay(null)}
      />
      <ConfirmDialog
        open={confirmEx !== null}
        title="Quitar ejercicio"
        message="¿Quitar este ejercicio del día?"
        confirmLabel="Quitar"
        tone="danger"
        onConfirm={() => {
          if (confirmEx) void mutations.removeExercise.mutateAsync(confirmEx);
          setConfirmEx(null);
        }}
        onCancel={() => setConfirmEx(null)}
      />
    </Modal>
  );
}