import { useState } from "react";
import { Footprints, Save } from "lucide-react";
import { Input, Textarea } from "../../../shared/ui/Input";
import { Select } from "../../../shared/ui/Select";
import { Field } from "../../../shared/ui/Field";
import DatePicker from "../../../shared/ui/DatePicker";
import { Button } from "../../../shared/ui/Button";
import { notify } from "../../../shared/ui/notify";
import { computePace } from "../../../shared/utils/pace";
import { parseDurationInput } from "../../../shared/utils/time";
import { RUN_TYPES } from "../../../shared/constants";
import type { RunType } from "../../../types/database";
import { useRunMutations } from "../hooks/useRuns";

export function RunForm({ onSaved }: { onSaved?: () => void }) {
  const { create } = useRunMutations();
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");
  const [runType, setRunType] = useState<RunType>("easy");
  const [elevation, setElevation] = useState("");
  const [hr, setHr] = useState("");
  const [calories, setCalories] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    const d = Number(distance);
    const durationSeconds = parseDurationInput(duration);
    if (!d || d <= 0 || durationSeconds === null) {
      notify.error("Introduce distancia y tiempo válidos.");
      return;
    }

    const startedAt = new Date(`${date}T12:00:00`).toISOString();
    setSaving(true);
    try {
      await create.mutateAsync({
        started_at: startedAt,
        ended_at: new Date(`${date}T12:00:00`).toISOString(),
        duration_seconds: durationSeconds,
        distance_km: d,
        pace_seconds_per_km: computePace(durationSeconds, d),
        elevation_gain: elevation.trim() ? Number(elevation) : null,
        avg_heart_rate: hr.trim() ? Number(hr) : null,
        calories: calories.trim() ? Number(calories) : null,
        run_type: runType,
        notes: notes.trim() || null,
      });
      notify.success("Carrera registrada 🏃");
      setDistance("");
      setDuration("");
      setElevation("");
      setHr("");
      setCalories("");
      setNotes("");
      onSaved?.();
    } catch {
      notify.error("No se pudo guardar la carrera.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-100 text-sky-600 dark:bg-sky-900/60 dark:text-sky-300">
          <Footprints className="h-6 w-6" />
        </div>
        <div>
          <h2 className="font-extrabold text-zinc-800 dark:text-zinc-100">Nueva carrera</h2>
          <p className="text-xs font-medium text-zinc-400">Distancia, tiempo y ritmo.</p>
        </div>
      </div>

      <Field label="Fecha">
        <DatePicker value={date} onChange={setDate} maxDate={new Date()} />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Distancia (km)">
          <Input
            type="number"
            inputMode="decimal"
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
            placeholder="5.42"
          />
        </Field>
        <Field label="Tiempo (mm:ss)">
          <Input
            inputMode="numeric"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="31:24"
          />
        </Field>
      </div>

      <Field label="Tipo">
        <Select value={runType} onChange={(v) => setRunType(v as RunType)}>
          {RUN_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </Select>
      </Field>

      <div className="grid grid-cols-3 gap-3">
        <Field label="Elevación (m)">
          <Input
            type="number"
            inputMode="decimal"
            value={elevation}
            onChange={(e) => setElevation(e.target.value)}
            placeholder="84"
          />
        </Field>
        <Field label="FC media">
          <Input
            type="number"
            inputMode="numeric"
            value={hr}
            onChange={(e) => setHr(e.target.value)}
            placeholder="154"
          />
        </Field>
        <Field label="Calorías">
          <Input
            type="number"
            inputMode="numeric"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            placeholder="320"
          />
        </Field>
      </div>

      <Field label="Notas (opcional)">
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Cómo fue la carrera…" />
      </Field>

      <Button size="lg" className="w-full" onClick={handleSubmit} disabled={saving}>
        <Save className="h-5 w-5" />
        {saving ? "Guardando…" : "Guardar carrera"}
      </Button>
    </div>
  );
}