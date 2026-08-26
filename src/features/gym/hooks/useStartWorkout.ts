import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/hooks/useAuth";
import * as api from "../api/workouts";
import { useWorkoutSessionStore, type ActiveExercise } from "../stores/workoutSessionStore";
import type { TemplateWithDays } from "../api/templates";

export function useStartWorkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const initSession = useWorkoutSessionStore((s) => s.initSession);
  const [starting, setStarting] = useState(false);

  async function startFromTemplate(
    template: TemplateWithDays,
    dayIndex: number,
    gymId?: string | null,
  ): Promise<void> {
    const day = template.template_days[dayIndex];
    if (!user || !day) return;

    setStarting(true);
    try {
      const workout = await api.createWorkout({
        user_id: user.id,
        gym_id: gymId ?? null,
        template_id: template.id,
        template_day_id: day.id,
        started_at: new Date().toISOString(),
      });

      const exercises: ActiveExercise[] = [];
      for (const tplEx of [...day.template_exercises].sort((a, b) => a.exercise_order - b.exercise_order)) {
        const we = await api.createWorkoutExercise({
          workout_id: workout.id,
          exercise_id: tplEx.exercise_id,
          exercise_order: tplEx.exercise_order,
          notes: tplEx.notes,
        });

        let previous: { weight: number | null; reps: number | null }[] | undefined;
        if (tplEx.exercise_id) {
          try {
            previous = (await api.getPreviousExerciseSets(tplEx.exercise_id)) ?? undefined;
          } catch {
            previous = undefined;
          }
        }

        exercises.push({
          workoutExerciseId: we.id,
          exerciseId: tplEx.exercise_id,
          exerciseName: tplEx.exercise?.name ?? "Ejercicio",
          order: tplEx.exercise_order,
          targetSets: tplEx.target_sets,
          targetReps: tplEx.target_reps,
          restSeconds: tplEx.rest_seconds,
          previous,
          sets: [],
        });
      }

      initSession(workout, exercises);
      navigate("/workout", { replace: true });
    } finally {
      setStarting(false);
    }
  }

  async function startFreeWorkout(gymId?: string | null): Promise<void> {
    if (!user) return;
    setStarting(true);
    try {
      const workout = await api.createWorkout({
        user_id: user.id,
        gym_id: gymId ?? null,
        started_at: new Date().toISOString(),
      });
      initSession(workout, []);
      navigate("/workout", { replace: true });
    } finally {
      setStarting(false);
    }
  }

  return { startFromTemplate, startFreeWorkout, starting };
}