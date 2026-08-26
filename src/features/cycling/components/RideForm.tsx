import { useState } from "react";
import { Bike, Save } from "lucide-react";
import { Input, Textarea } from "../../../shared/ui/Input";
import { Select } from "../../../shared/ui/Select";
import { Field } from "../../../shared/ui/Field";
import DatePicker from "../../../shared/ui/DatePicker";
import { Button } from "../../../shared/ui/Button";
import { notify } from "../../../shared/ui/notify";
import { computeAvgSpeedKmh } from "../../../shared/utils/pace";
import { parseDurationInput } from "../../../shared/utils/time";
import { RIDE_TYPES } from "../../../shared/constants";
import type { RideType } from "../../../types/database";
import { useRideMutations } from "../hooks/useRides";

export function RideForm({ onSaved }: { onSaved?: () => void }) {
  const { create } = useRideMutations();
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");
  const [rideType, setRideType] = useState<RideType>("road");
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
        ended_at: startedAt,
        duration_seconds: durationSeconds,
        distance_km: d,
        avg_speed_kmh: computeAvgSpeedKmh(durationSeconds, d),
        elevation_gain: elevation.trim() ? Number(elevation) : null,
        avg_heart_rate: hr.trim() ? Number(hr) : null,
        calories: calories.trim() ? Number(calories) : null,
        ride_type: rideType,
        notes: notes.trim() || null,
      });
      notify.success("Salida registrada 🚴");
      setDistance("");
      setDuration("");
      setElevation("");
      setHr("");
      setCalories("");
      setNotes("");
      onSaved?.();
    } catch {
      notify.error("No se pudo guardar la salida.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/60 dark:text-emerald-300">
          <Bike className="h-6 w-6" />
        </div>
        <div>
          <h2 className="font-extrabold text-zinc-800 dark:text-zinc-100">Nueva salida</h2>
          <p className="text-xs font-medium text-zinc-400">Distancia, tiempo y velocidad.</p>
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
            placeholder="32.4"
          />
        </Field>
        <Field label="Tiempo (h:mm:ss)">
          <Input
            inputMode="numeric"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="1:28:32"
          />
        </Field>
      </div>

      <Field label="Tipo">
        <Select value={rideType} onChange={(v) => setRideType(v as RideType)}>
          {RIDE_TYPES.map((t) => (
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
            placeholder="438"
          />
        </Field>
        <Field label="FC media">
          <Input
            type="number"
            inputMode="numeric"
            value={hr}
            onChange={(e) => setHr(e.target.value)}
            placeholder="148"
          />
        </Field>
        <Field label="Calorías">
          <Input
            type="number"
            inputMode="numeric"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            placeholder="520"
          />
        </Field>
      </div>

      <Field label="Notas (opcional)">
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Cómo fue la salida…" />
      </Field>

      <Button size="lg" className="w-full" onClick={handleSubmit} disabled={saving}>
        <Save className="h-5 w-5" />
        {saving ? "Guardando…" : "Guardar salida"}
      </Button>
    </div>
  );
}