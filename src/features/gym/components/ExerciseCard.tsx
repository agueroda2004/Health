import { Check, Dumbbell, Trash2 } from "lucide-react";
import { Card } from "../../../shared/ui/Card";
import { IconButton } from "../../../shared/ui/IconButton";
import { SetRecorder } from "./SetRecorder";
import type { ActiveExercise } from "../stores/workoutSessionStore";
import { useWorkoutSets } from "../hooks/useWorkoutSets";
import { cn } from "../../../shared/utils/cn";

type ExerciseCardProps = {
  exercise: ActiveExercise;
};

export function ExerciseCard({ exercise }: ExerciseCardProps) {
  const { toggleSet, deleteSet } = useWorkoutSets();

  return (
    <Card className="overflow-hidden p-4">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-100 text-primary-600 dark:bg-primary-900/60 dark:text-primary-300">
          <Dumbbell className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-extrabold text-zinc-800 dark:text-zinc-100">
            {exercise.exerciseName}
          </h3>
          <p className="text-xs font-medium text-zinc-400">
            {exercise.targetSets ? `${exercise.targetSets} series` : ""}
            {exercise.targetReps ? ` · ${exercise.targetReps} reps` : ""}
            {exercise.restSeconds ? ` · ${exercise.restSeconds}s` : ""}
          </p>
        </div>
      </div>

      {exercise.previous && exercise.previous.length > 0 && (
        <div className="mb-3 rounded-xl bg-zinc-100 px-3 py-2 dark:bg-zinc-800">
          <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">Last time</p>
          <div className="mt-1 flex flex-wrap gap-2">
            {exercise.previous.map((p, i) => (
              <span
                key={i}
                className="rounded-lg bg-white px-2 py-1 text-xs font-bold text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300"
              >
                {p.weight ?? "–"} kg × {p.reps ?? "–"}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        {exercise.sets.map((set, i) => (
          <div
            key={set.id}
            className={cn(
              "flex items-center gap-3 rounded-xl border-2 px-3 py-2 transition",
              set.completed
                ? "border-primary-200 bg-primary-50 dark:border-primary-800/60 dark:bg-primary-950/20"
                : "border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900",
            )}
          >
            <span className="w-6 text-center text-sm font-extrabold text-zinc-400">
              {i + 1}
            </span>
            <div className="flex-1 text-sm font-extrabold text-zinc-700 dark:text-zinc-200">
              {set.weight ?? "–"} kg × {set.reps ?? "–"}
              {set.is_warmup && (
                <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
                  Warmup
                </span>
              )}
            </div>
            <IconButton
              label={set.completed ? "Desmarcar serie" : "Completar serie"}
              active={set.completed}
              onClick={() => void toggleSet(set.id, !set.completed)}
              className="h-9 w-9"
            >
              {set.completed ? <CheckIcon /> : null}
            </IconButton>
            <IconButton
              label="Eliminar serie"
              onClick={() => void deleteSet(set.id)}
              className="h-9 w-9 text-red-500"
            >
              <Trash2 className="h-4 w-4" />
            </IconButton>
          </div>
        ))}
      </div>

      <div className="mt-3">
        <SetRecorder exercise={exercise} />
      </div>
    </Card>
  );
}

function CheckIcon() {
  return <Check className="h-4 w-4" />;
}