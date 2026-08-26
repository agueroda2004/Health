import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { supabase } from "../../lib/supabase/client";
import { workoutVolume } from "../utils/volume";
import { currentStreak, bestStreak } from "../utils/streak";
import { computePace, computeAvgSpeedKmh } from "../utils/pace";
import type { DateFilter } from "../types/activity";
import { toISODate } from "../utils/dates";

function dateFilterStart(filter: DateFilter): Date | null {
  const now = new Date();
  switch (filter) {
    case "7d":
      return new Date(now.getTime() - 7 * 86400000);
    case "30d":
      return new Date(now.getTime() - 30 * 86400000);
    case "3m":
      return new Date(now.getTime() - 90 * 86400000);
    case "year":
      return new Date(now.getFullYear(), 0, 1);
    case "all":
      return null;
    default:
      return null;
  }
}

type RawSet = { weight: number | null; reps: number | null; completed: boolean; is_warmup: boolean };
type RawWorkoutExercise = { exercise_id: string | null; sets: RawSet[] };
type RawWorkout = { id: string; started_at: string; duration_seconds: number | null; workout_exercises: RawWorkoutExercise[] };
type RawRun = { id: string; started_at: string; duration_seconds: number; distance_km: number; elevation_gain: number | null };
type RawRide = { id: string; started_at: string; duration_seconds: number; distance_km: number; elevation_gain: number | null };
type RawPR = { weight: number | null; reps: number | null; achieved_at: string; exercise_id: string | null };
type RawExercise = { id: string; muscle_group: string | null; name: string };

function normalizeSets(raw: RawSet[]) {
  return raw.map((s) => ({
    weight: s.weight,
    reps: s.reps,
    completed: s.completed,
    isWarmup: s.is_warmup,
  }));
}

export type Statistics = {
  workouts: number;
  totalTimeSeconds: number;
  currentStreak: number;
  bestStreak: number;
  gym: {
    workouts: number;
    totalSets: number;
    totalVolume: number;
    muscleGroups: { name: string; count: number }[];
    prs: { exercise: string; weight: number | null; reps: number | null }[];
  };
  running: {
    count: number;
    distanceKm: number;
    timeSeconds: number;
    avgPace: number | null;
    longestKm: number;
  };
  cycling: {
    count: number;
    distanceKm: number;
    timeSeconds: number;
    avgSpeed: number | null;
    elevationGain: number;
    longestKm: number;
  };
};

export function useStatistics(filter: DateFilter) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["statistics", filter],
    queryFn: async (): Promise<Statistics> => {
      const start = dateFilterStart(filter);

      const [{ data: workouts }, { data: runs }, { data: rides }, { data: prs }, { data: muscleMap }] =
        await Promise.all([
          supabase
            .from("fitness_workouts")
            .select("id, started_at, duration_seconds, workout_exercises:fitness_workout_exercises(exercise_id, sets:fitness_workout_sets(weight, reps, completed, is_warmup))")
            .not("completed_at", "is", null)
            .order("started_at", { ascending: false })
            .limit(1000),
          supabase
            .from("fitness_runs")
            .select("*")
            .order("started_at", { ascending: false })
            .limit(1000),
          supabase
            .from("fitness_rides")
            .select("*")
            .order("started_at", { ascending: false })
            .limit(1000),
          supabase
            .from("fitness_personal_records")
            .select("weight, reps, achieved_at, exercise_id")
            .order("achieved_at", { ascending: false })
            .limit(200),
          supabase
            .from("fitness_exercises")
            .select("id, muscle_group")
            .limit(1000),
        ]);

      const allWorkouts = (workouts ?? []) as unknown as RawWorkout[];
      const allRuns = (runs ?? []) as unknown as RawRun[];
      const allRides = (rides ?? []) as unknown as RawRide[];
      const allPRs = (prs ?? []) as unknown as RawPR[];
      const allExercises = (muscleMap ?? []) as unknown as RawExercise[];

      const filteredWorkouts = allWorkouts.filter((w) =>
        start ? new Date(w.started_at) >= start : true,
      );
      const filteredRuns = allRuns.filter((r) =>
        start ? new Date(r.started_at) >= start : true,
      );
      const filteredRides = allRides.filter((r) =>
        start ? new Date(r.started_at) >= start : true,
      );

      const allDates = [
        ...filteredWorkouts.map((w) => toISODate(new Date(w.started_at))),
        ...filteredRuns.map((r) => toISODate(new Date(r.started_at))),
        ...filteredRides.map((r) => toISODate(new Date(r.started_at))),
      ];

      let totalSets = 0;
      let totalVolume = 0;
      for (const w of filteredWorkouts) {
        const exercises = w.workout_exercises ?? [];
        for (const ex of exercises) {
          const sets = normalizeSets(ex.sets ?? []);
          totalSets += sets.filter((s) => s.completed && !s.isWarmup).length;
          totalVolume += workoutVolume(sets);
        }
      }

      const mgMap = new Map<string, number>();
      const muscleById = new Map<string, string>();
      for (const m of allExercises) {
        if (m.muscle_group) muscleById.set(m.id, m.muscle_group);
      }
      for (const w of filteredWorkouts) {
        const exercises = w.workout_exercises ?? [];
        for (const ex of exercises) {
          const name = ex.exercise_id ? muscleById.get(ex.exercise_id) : null;
          if (name) mgMap.set(name, (mgMap.get(name) ?? 0) + 1);
        }
      }

      const runDistance = filteredRuns.reduce((s, r) => s + (r.distance_km ?? 0), 0);
      const runTime = filteredRuns.reduce((s, r) => s + (r.duration_seconds ?? 0), 0);
      const runPaceValues = filteredRuns
        .map((r) => computePace(r.duration_seconds ?? 0, r.distance_km ?? 0))
        .filter((p): p is number => p !== null);
      const avgPace =
        runPaceValues.length > 0
          ? runPaceValues.reduce((s, p) => s + p, 0) / runPaceValues.length
          : null;

      const rideDistance = filteredRides.reduce((s, r) => s + (r.distance_km ?? 0), 0);
      const rideTime = filteredRides.reduce((s, r) => s + (r.duration_seconds ?? 0), 0);
      const rideSpeeds = filteredRides
        .map((r) => computeAvgSpeedKmh(r.duration_seconds ?? 0, r.distance_km ?? 0))
        .filter((s): s is number => s !== null);
      const avgSpeed =
        rideSpeeds.length > 0
          ? rideSpeeds.reduce((s, v) => s + v, 0) / rideSpeeds.length
          : null;

      const prList = allPRs.map((p) => ({
        exercise: p.exercise_id ?? "—",
        weight: p.weight,
        reps: p.reps,
      }));

      const prNames = new Map<string, string>();
      for (const m of allExercises) prNames.set(m.id, m.name);

      return {
        workouts: filteredWorkouts.length,
        totalTimeSeconds:
          filteredWorkouts.reduce((s, w) => s + (w.duration_seconds ?? 0), 0) +
          runTime +
          rideTime,
        currentStreak: currentStreak(allDates),
        bestStreak: bestStreak(allDates),
        gym: {
          workouts: filteredWorkouts.length,
          totalSets,
          totalVolume,
          muscleGroups: [...mgMap.entries()]
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count),
          prs: prList.map((p) => ({
            exercise: prNames.get(p.exercise) ?? "—",
            weight: p.weight,
            reps: p.reps,
          })),
        },
        running: {
          count: filteredRuns.length,
          distanceKm: runDistance,
          timeSeconds: runTime,
          avgPace,
          longestKm: filteredRuns.reduce((s, r) => Math.max(s, r.distance_km ?? 0), 0),
        },
        cycling: {
          count: filteredRides.length,
          distanceKm: rideDistance,
          timeSeconds: rideTime,
          avgSpeed,
          elevationGain: filteredRides.reduce((s, r) => s + (r.elevation_gain ?? 0), 0),
          longestKm: filteredRides.reduce((s, r) => Math.max(s, r.distance_km ?? 0), 0),
        },
      };
    },
    enabled: !!user,
  });
}