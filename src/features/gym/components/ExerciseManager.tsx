import { useState } from "react";
import { Dumbbell, Pencil, Plus, Trash2 } from "lucide-react";
import { Card } from "../../../shared/ui/Card";
import { Button } from "../../../shared/ui/Button";
import { Input } from "../../../shared/ui/Input";
import { Select } from "../../../shared/ui/Select";
import { Field } from "../../../shared/ui/Field";
import { Modal } from "../../../shared/ui/Modal";
import { ConfirmDialog } from "../../../shared/ui/ConfirmDialog";
import { EmptyState } from "../../../shared/ui/EmptyState";
import { Skeleton } from "../../../shared/ui/Skeleton";
import { IconButton } from "../../../shared/ui/IconButton";
import { Badge } from "../../../shared/ui/Badge";
import { notify } from "../../../shared/ui/notify";
import { useExercises, useExerciseMutations } from "../hooks/useExercises";
import { hasExerciseDependencies } from "../api/exercises";
import { MUSCLE_GROUPS } from "../../../shared/constants";
import type { MuscleGroup } from "../../../types/database";

export function ExerciseManager() {
  const { data: exercises, isLoading } = useExercises();
  const { create, update, remove } = useExerciseMutations();

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup | "">("");
  const [equipment, setEquipment] = useState("");
  const [description, setDescription] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [saving, setSaving] = useState(false);

  function openNew() {
    setEditingId(null);
    setName("");
    setMuscleGroup("");
    setEquipment("");
    setDescription("");
    setOpen(true);
  }

  function openEdit(ex: {
    id: string;
    name: string;
    muscle_group: MuscleGroup | null;
    equipment: string | null;
    description: string | null;
  }) {
    setEditingId(ex.id);
    setName(ex.name);
    setMuscleGroup(ex.muscle_group ?? "");
    setEquipment(ex.equipment ?? "");
    setDescription(ex.description ?? "");
    setOpen(true);
  }

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        muscle_group: (muscleGroup as MuscleGroup | null) ?? null,
        equipment: equipment.trim() || null,
        description: description.trim() || null,
      };
      if (editingId) {
        await update.mutateAsync({ id: editingId, input: payload });
      } else {
        await create.mutateAsync(payload);
      }
      setOpen(false);
      notify.success(editingId ? "Ejercicio actualizado" : "Ejercicio creado");
    } catch {
      notify.error("No se pudo guardar el ejercicio.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setChecking(true);
    try {
      const hasDeps = await hasExerciseDependencies(id);
      if (hasDeps) {
        notify.error("Este ejercicio está en uso en rutinas o entrenamientos.");
        return;
      }
      await remove.mutateAsync(id);
      notify.success("Ejercicio eliminado");
    } catch {
      notify.error("No se pudo eliminar el ejercicio.");
    } finally {
      setChecking(false);
      setConfirmId(null);
    }
  }

  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-extrabold text-zinc-800 dark:text-zinc-100">Ejercicios</h3>
        <Button size="sm" onClick={openNew}>
          <Plus className="h-4 w-4" />
          Nuevo
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-14" />
      ) : exercises && exercises.length > 0 ? (
        <div className="space-y-2">
          {exercises.map((ex) => (
            <div
              key={ex.id}
              className="flex items-center gap-3 rounded-2xl border border-zinc-100 px-3 py-2.5 dark:border-zinc-800"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-100 text-primary-600 dark:bg-primary-900/60 dark:text-primary-300">
                <Dumbbell className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-extrabold text-zinc-800 dark:text-zinc-100">
                  {ex.name}
                </p>
                {ex.muscle_group && <Badge className="mt-0.5">{ex.muscle_group}</Badge>}
              </div>
              <IconButton label="Editar" onClick={() => openEdit(ex)} className="h-9 w-9">
                <Pencil className="h-4 w-4" />
              </IconButton>
              <IconButton
                label="Eliminar"
                onClick={() => setConfirmId(ex.id)}
                className="h-9 w-9 text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </IconButton>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Dumbbell className="h-6 w-6" />}
          title="Sin ejercicios"
          description="Crea tus ejercicios personalizados para usarlos en tus rutinas."
        />
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editingId ? "Editar ejercicio" : "Nuevo ejercicio"}>
        <div className="space-y-4">
          <Field label="Nombre">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Bench Press" />
          </Field>
          <Field label="Grupo muscular">
            <Select value={muscleGroup} onChange={(v) => setMuscleGroup(v as MuscleGroup | "")}>
              <option value="">Sin grupo</option>
              {MUSCLE_GROUPS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Equipamiento (opcional)">
            <Input value={equipment} onChange={(e) => setEquipment(e.target.value)} placeholder="Barbell, dumbbell…" />
          </Field>
          <Field label="Descripción (opcional)">
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Notas sobre el ejercicio" />
          </Field>
          <Button size="lg" className="w-full" onClick={handleSave} disabled={saving || !name.trim()}>
            {saving ? "Guardando…" : "Guardar"}
          </Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmId !== null}
        title="Eliminar ejercicio"
        message="¿Seguro que quieres eliminar este ejercicio?"
        confirmLabel="Eliminar"
        tone="danger"
        loading={checking}
        onConfirm={() => confirmId && void handleDelete(confirmId)}
        onCancel={() => setConfirmId(null)}
      />
    </Card>
  );
}