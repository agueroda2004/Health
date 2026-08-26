import { useState } from "react";
import { Check } from "lucide-react";
import { Input } from "../../../shared/ui/Input";
import { Button } from "../../../shared/ui/Button";
import type { ActiveExercise } from "../stores/workoutSessionStore";
import { useWorkoutSets } from "../hooks/useWorkoutSets";
import { useWorkoutSessionStore } from "../stores/workoutSessionStore";

type SetRecorderProps = {
  exercise: ActiveExercise;
  defaultWeight?: number | null;
  defaultReps?: number | null;
};

export function SetRecorder({ exercise, defaultWeight, defaultReps }: SetRecorderProps) {
  const { addSet } = useWorkoutSets();
  const [weight, setWeight] = useState(defaultWeight != null ? String(defaultWeight) : "");
  const [reps, setReps] = useState(defaultReps != null ? String(defaultReps) : "");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    const w = weight.trim() === "" ? null : Number(weight);
    const r = reps.trim() === "" ? null : Number(reps);
    if (r === null || r <= 0 || Number.isNaN(r)) return;
    setSubmitting(true);
    await addSet(exercise.workoutExerciseId, { weight: w, reps: r });
    setSubmitting(false);
    const current = useWorkoutSessionStore
      .getState()
      .exercises.find((e) => e.workoutExerciseId === exercise.workoutExerciseId);
    const last = current?.sets[current.sets.length - 1];
    if (last) setWeight(last.weight != null ? String(last.weight) : "");
    setReps("");
  }

  return (
    <div className="rounded-2xl border-2 border-primary-200 bg-primary-50/50 p-4 dark:border-primary-800/60 dark:bg-primary-950/20">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-zinc-400">
            Peso (kg)
          </span>
          <Input
            type="number"
            inputMode="decimal"
            placeholder={String(exercise.sets[exercise.sets.length - 1]?.weight ?? defaultWeight ?? 0)}
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="h-14 text-lg font-extrabold"
          />
        </div>
        <div>
          <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-zinc-400">
            Reps
          </span>
          <Input
            type="number"
            inputMode="numeric"
            placeholder="8"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            className="h-14 text-lg font-extrabold"
          />
        </div>
      </div>

      <Button
        size="lg"
        className="mt-3 w-full"
        onClick={handleSubmit}
        disabled={submitting || reps.trim() === ""}
      >
        <Check className="h-5 w-5" />
        Registrar serie
      </Button>
    </div>
  );
}