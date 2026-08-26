import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../lib/supabase/client";
import { useAuth } from "../../auth/hooks/useAuth";
import * as api from "../api/workouts";
import { useWorkoutSessionStore } from "../stores/workoutSessionStore";
import { evaluatePR, computeBest, type PRCandidate } from "../../../shared/utils/prs";
import { notify } from "../../../shared/ui/notify";

type PRRecord = {
  exerciseId: string;
  weight: number;
  reps: number;
};

async function savePRs(userId: string, records: PRRecord[]): Promise<void> {
  for (const r of records) {
    const { error } = await supabase.from("fitness_personal_records").insert({
      user_id: userId,
      exercise_id: r.exerciseId,
      weight: r.weight,
      reps: r.reps,
      achieved_at: new Date().toISOString(),
    });
    if (error) throw error;
  }
}

export function useFinishWorkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const workout = useWorkoutSessionStore((s) => s.workout);
  const exercises = useWorkoutSessionStore((s) => s.exercises);
  const clearSession = useWorkoutSessionStore((s) => s.clearSession);
  const [finishing, setFinishing] = useState(false);

  async function finishWorkout() {
    if (!user || !workout) return;
    setFinishing(true);
    try {
      const now = new Date();
      const durationSeconds = Math.max(
        1,
        Math.round((now.getTime() - new Date(workout.started_at).getTime()) / 1000),
      );
      await api.updateWorkout(workout.id, {
        completed_at: now.toISOString(),
        duration_seconds: durationSeconds,
      });

      const prRecords: PRRecord[] = [];
      for (const ex of exercises) {
        if (!ex.exerciseId || ex.sets.length === 0) continue;

        const candidates: PRCandidate[] = ex.sets.map((s) => ({
          weight: s.weight,
          reps: s.reps,
          completed: s.completed,
          isWarmup: s.is_warmup,
        }));

        const best = computeBest(candidates);
        if (!best) continue;

        const { data: existing } = await supabase
          .from("fitness_personal_records")
          .select("weight, reps")
          .eq("user_id", user.id)
          .eq("exercise_id", ex.exerciseId)
          .order("achieved_at", { ascending: false })
          .limit(1);

        const currentBest = existing?.[0]
          ? { weight: existing[0].weight ?? 0, reps: existing[0].reps ?? 0 }
          : null;

        const anyPR = candidates.some((s) => {
          const res = evaluatePR(s, currentBest);
          return res.isWeightPR || res.isRepsPR;
        });
        if (anyPR) {
          prRecords.push({
            exerciseId: ex.exerciseId,
            weight: best.weight,
            reps: best.reps,
          });
        }
      }

      if (prRecords.length > 0) {
        await savePRs(user.id, prRecords);
      }

      clearSession();
      navigate("/", { replace: true });
      notify.success("Workout completado 💪");
    } catch {
      notify.error("Algo salió mal al finalizar.");
    } finally {
      setFinishing(false);
    }
  }

  return { finishWorkout, finishing };
}