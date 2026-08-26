import { supabase } from "./supabase/client";
import type { UnifiedActivity, WeekSummary } from "../shared/types/activity";
import { weekStart, toISODate } from "../shared/utils/dates";
import { workoutVolume, type SetRecord } from "../shared/utils/volume";

type RawSet = { weight: number | null; reps: number | null; completed: boolean; is_warmup: boolean };
type RawWorkoutExercise = { exercise_id: string | null; sets: RawSet[] };
type RawWorkout = {
  id: string;
  started_at: string;
  duration_seconds: number | null;
  template_day_id: string | null;
  workout_exercises: RawWorkoutExercise[];
};
type RawDistance = { id: string; started_at: string; duration_seconds: number; distance_km: number | null };

function normalizeSets(raw: RawSet[]): SetRecord[] {
  return raw.map((s) => ({
    weight: s.weight,
    reps: s.reps,
    completed: s.completed,
    isWarmup: s.is_warmup,
  }));
}

export async function fetchUnifiedActivities(): Promise<UnifiedActivity[]> {
  const [{ data: workouts }, { data: runs }, { data: rides }] = await Promise.all([
    supabase
      .from("fitness_workouts")
      .select("id, started_at, duration_seconds, template_day_id, workout_exercises:fitness_workout_exercises(exercise_id, sets:fitness_workout_sets(weight, reps, completed, is_warmup))")
      .not("completed_at", "is", null)
      .order("started_at", { ascending: false })
      .limit(200),
    supabase
      .from("fitness_runs")
      .select("id, started_at, duration_seconds, distance_km")
      .order("started_at", { ascending: false })
      .limit(200),
    supabase
      .from("fitness_rides")
      .select("id, started_at, duration_seconds, distance_km")
      .order("started_at", { ascending: false })
      .limit(200),
  ]);

  const workoutRows = (workouts ?? []) as unknown as RawWorkout[];
  const runRows = (runs ?? []) as unknown as RawDistance[];
  const rideRows = (rides ?? []) as unknown as RawDistance[];

  const activities: UnifiedActivity[] = [];

  for (const w of workoutRows) {
    const exercises = w.workout_exercises ?? [];
    const totalVolume = exercises.reduce(
      (sum, ex) => sum + workoutVolume(normalizeSets(ex.sets ?? [])),
      0,
    );
    activities.push({
      id: w.id,
      kind: "gym",
      title: w.template_day_id ? "Workout" : "Entrenamiento libre",
      date: toISODate(new Date(w.started_at)),
      durationSeconds: w.duration_seconds ?? 0,
      volume: totalVolume,
      exerciseCount: exercises.length,
    });
  }

  for (const r of runRows) {
    activities.push({
      id: r.id,
      kind: "run",
      title: "Carrera",
      date: toISODate(new Date(r.started_at)),
      durationSeconds: r.duration_seconds ?? 0,
      distanceKm: r.distance_km ?? undefined,
    });
  }

  for (const r of rideRows) {
    activities.push({
      id: r.id,
      kind: "ride",
      title: "Ciclismo",
      date: toISODate(new Date(r.started_at)),
      durationSeconds: r.duration_seconds ?? 0,
      distanceKm: r.distance_km ?? undefined,
    });
  }

  activities.sort((a, b) => (a.date < b.date ? 1 : -1));
  return activities;
}

export async function fetchWeekSummary(): Promise<WeekSummary> {
  const start = weekStart(toISODate(new Date()));
  const today = toISODate(new Date());

  const [{ data: workouts }, { data: runs }, { data: rides }] = await Promise.all([
    supabase
      .from("fitness_workouts")
      .select("id, started_at")
      .not("completed_at", "is", null)
      .gte("started_at", `${start}T00:00:00`)
      .lte("started_at", `${today}T23:59:59`),
    supabase
      .from("fitness_runs")
      .select("id, started_at, distance_km")
      .gte("started_at", `${start}T00:00:00`)
      .lte("started_at", `${today}T23:59:59`),
    supabase
      .from("fitness_rides")
      .select("id, started_at, distance_km")
      .gte("started_at", `${start}T00:00:00`)
      .lte("started_at", `${today}T23:59:59`),
  ]);

  type DistanceRow = { id: string; started_at: string; distance_km: number | null };
  const runRows = (runs ?? []) as unknown as DistanceRow[];
  const rideRows = (rides ?? []) as unknown as DistanceRow[];

  const runKm = runRows.reduce((s, r) => s + (r.distance_km ?? 0), 0);
  const rideKm = rideRows.reduce((s, r) => s + (r.distance_km ?? 0), 0);

  return {
    gymWorkouts: workouts?.length ?? 0,
    runKm,
    rideKm,
  };
}