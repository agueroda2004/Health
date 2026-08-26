import { useState } from "react";
import { Dumbbell, MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { Card } from "../../../shared/ui/Card";
import { Button } from "../../../shared/ui/Button";
import { Input, Textarea } from "../../../shared/ui/Input";
import { Field } from "../../../shared/ui/Field";
import { Modal } from "../../../shared/ui/Modal";
import { ConfirmDialog } from "../../../shared/ui/ConfirmDialog";
import { EmptyState } from "../../../shared/ui/EmptyState";
import { Skeleton } from "../../../shared/ui/Skeleton";
import { IconButton } from "../../../shared/ui/IconButton";
import { notify } from "../../../shared/ui/notify";
import { useGyms, useGymMutations } from "../hooks/useGyms";
import { hasGymDependencies } from "../api/gyms";

export function GymManager() {
  const { data: gyms, isLoading } = useGyms();
  const { create, update, remove } = useGymMutations();

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nombre, setNombre] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [saving, setSaving] = useState(false);

  function openNew() {
    setEditingId(null);
    setNombre("");
    setAddress("");
    setNotes("");
    setOpen(true);
  }

  function openEdit(gym: { id: string; gym_nombre: string; address: string | null; notes: string | null }) {
    setEditingId(gym.id);
    setNombre(gym.gym_nombre);
    setAddress(gym.address ?? "");
    setNotes(gym.notes ?? "");
    setOpen(true);
  }

  async function handleSave() {
    if (!nombre.trim()) return;
    setSaving(true);
    try {
      if (editingId) {
        await update.mutateAsync({
          id: editingId,
          input: { gym_nombre: nombre.trim(), address: address || null, notes: notes || null },
        });
      } else {
        await create.mutateAsync({
          gym_nombre: nombre.trim(),
          address: address || null,
          notes: notes || null,
        });
      }
      setOpen(false);
      notify.success(editingId ? "Gimnasio actualizado" : "Gimnasio creado");
    } catch {
      notify.error("No se pudo guardar el gimnasio.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setChecking(true);
    try {
      const hasDeps = await hasGymDependencies(id);
      if (hasDeps) {
        notify.error("Este gimnasio tiene entrenamientos asociados.");
        return;
      }
      await remove.mutateAsync(id);
      notify.success("Gimnasio eliminado");
    } catch {
      notify.error("No se pudo eliminar el gimnasio.");
    } finally {
      setChecking(false);
      setConfirmId(null);
    }
  }

  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-extrabold text-zinc-800 dark:text-zinc-100">Gimnasios</h3>
        <Button size="sm" onClick={openNew}>
          <Plus className="h-4 w-4" />
          Nuevo
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-14" />
      ) : gyms && gyms.length > 0 ? (
        <div className="space-y-2">
          {gyms.map((g) => (
            <div
              key={g.id}
              className="flex items-center gap-3 rounded-2xl border border-zinc-100 px-3 py-2.5 dark:border-zinc-800"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-100 text-primary-600 dark:bg-primary-900/60 dark:text-primary-300">
                <Dumbbell className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-extrabold text-zinc-800 dark:text-zinc-100">
                  {g.gym_nombre}
                </p>
                {g.address && (
                  <p className="flex items-center gap-1 truncate text-xs font-medium text-zinc-400">
                    <MapPin className="h-3 w-3" />
                    {g.address}
                  </p>
                )}
              </div>
              <IconButton label="Editar" onClick={() => openEdit(g)} className="h-9 w-9">
                <Pencil className="h-4 w-4" />
              </IconButton>
              <IconButton
                label="Eliminar"
                onClick={() => setConfirmId(g.id)}
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
          title="Sin gimnasios"
          description="Añade tu gimnasio para registrarlo en tus entrenamientos."
        />
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editingId ? "Editar gimnasio" : "Nuevo gimnasio"}>
        <div className="space-y-4">
          <Field label="Nombre">
            <Input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Powerhouse Gym"
            />
          </Field>
          <Field label="Dirección (opcional)">
            <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Calle, ciudad…" />
          </Field>
          <Field label="Notas (opcional)">
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Horario, accesos…" />
          </Field>
          <Button size="lg" className="w-full" onClick={handleSave} disabled={saving || !nombre.trim()}>
            {saving ? "Guardando…" : "Guardar"}
          </Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmId !== null}
        title="Eliminar gimnasio"
        message="¿Seguro que quieres eliminar este gimnasio?"
        confirmLabel="Eliminar"
        tone="danger"
        loading={checking}
        onConfirm={() => confirmId && void handleDelete(confirmId)}
        onCancel={() => setConfirmId(null)}
      />
    </Card>
  );
}