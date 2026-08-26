import { useWorkoutSessionStore } from "../stores/workoutSessionStore";
import * as api from "../api/workouts";
import { notify } from "../../../shared/ui/notify";

export function useWorkoutSets() {
  const upsertSet = useWorkoutSessionStore((s) => s.upsertSet);
  const replaceSet = useWorkoutSessionStore((s) => s.replaceSet);
  const removeSet = useWorkoutSessionStore((s) => s.removeSet);

  async function addSet(
    workoutExerciseId: string,
    input: { weight: number | null; reps: number | null; isWarmup?: boolean },
  ) {
    const exercise = useWorkoutSessionStore
      .getState()
      .exercises.find((e) => e.workoutExerciseId === workoutExerciseId);
    const setNumber = (exercise?.sets.reduce((max, s) => Math.max(max, s.set_number), 0) ?? 0) + 1;

    const tempId = `temp-${Date.now()}`;
    const optimistic: Parameters<typeof upsertSet>[1] = {
      id: tempId,
      workout_exercise_id: workoutExerciseId,
      set_number: setNumber,
      weight: input.weight,
      reps: input.reps,
      duration_seconds: null,
      distance: null,
      is_warmup: input.isWarmup ?? false,
      completed: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    upsertSet(workoutExerciseId, optimistic);

    try {
      const created = await api.createSet({
        workout_exercise_id: workoutExerciseId,
        set_number: setNumber,
        weight: input.weight,
        reps: input.reps,
        is_warmup: input.isWarmup ?? false,
        completed: true,
      });
      replaceSet(workoutExerciseId, tempId, created);
    } catch {
      removeSet(tempId);
      notify.error("No se pudo guardar la serie.");
    }
  }

  async function toggleSet(setId: string, completed: boolean) {
    const state = useWorkoutSessionStore.getState();
    for (const ex of state.exercises) {
      const set = ex.sets.find((s) => s.id === setId);
      if (set) {
        upsertSet(ex.workoutExerciseId, { ...set, completed });
        try {
          const updated = await api.updateSet(setId, { completed });
          upsertSet(ex.workoutExerciseId, updated);
        } catch {
          upsertSet(ex.workoutExerciseId, { ...set, completed: !completed });
          notify.error("No se pudo actualizar la serie.");
        }
        return;
      }
    }
  }

  async function deleteSet(setId: string) {
    removeSet(setId);
    try {
      await api.deleteSet(setId);
    } catch {
      notify.error("No se pudo eliminar la serie.");
    }
  }

  return { addSet, toggleSet, deleteSet };
}