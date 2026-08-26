import { supabase } from "../../../lib/supabase/client";
import type { Database } from "../../../types/database";

type WorkoutRow = Database["public"]["Tables"]["fitness_workouts"]["Row"];
type WorkoutInsert = Database["public"]["Tables"]["fitness_workouts"]["Insert"];
type WorkoutExerciseRow = Database["public"]["Tables"]["fitness_workout_exercises"]["Row"];
type WorkoutExerciseInsert = Database["public"]["Tables"]["fitness_workout_exercises"]["Insert"];
type SetRow = Database["public"]["Tables"]["fitness_workout_sets"]["Row"];
type SetInsert = Database["public"]["Tables"]["fitness_workout_sets"]["Insert"];
type SetUpdate = Database["public"]["Tables"]["fitness_workout_sets"]["Update"];

export type WorkoutExerciseWithSets = WorkoutExerciseRow & {
  exercise?: { id: string; name: string } | null;
  sets: SetRow[];
};

export type WorkoutWithExercises = WorkoutRow & {
  workout_exercises: WorkoutExerciseWithSets[];
};

export async function createWorkout(input: WorkoutInsert): Promise<WorkoutRow> {
  const { data, error } = await supabase.from("fitness_workouts").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function updateWorkout(id: string, input: Partial<WorkoutInsert>): Promise<WorkoutRow> {
  const { data, error } = await supabase
    .from("fitness_workouts")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteWorkout(id: string): Promise<void> {
  const { error } = await supabase.from("fitness_workouts").delete().eq("id", id);
  if (error) throw error;
}

export async function createWorkoutExercise(input: WorkoutExerciseInsert): Promise<WorkoutExerciseRow> {
  const { data, error } = await supabase
    .from("fitness_workout_exercises")
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function listWorkoutExercises(workoutId: string): Promise<WorkoutExerciseWithSets[]> {
  const { data, error } = await supabase
    .from("fitness_workout_exercises")
    .select("*, exercise:fitness_exercises(id, name), sets:fitness_workout_sets(*)")
    .eq("workout_id", workoutId)
    .order("exercise_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as WorkoutExerciseWithSets[];
}

export async function getWorkoutWithExercises(id: string): Promise<WorkoutWithExercises | null> {
  const { data, error } = await supabase
    .from("fitness_workouts")
    .select("*, workout_exercises:fitness_workout_exercises(*, exercise:fitness_exercises(id, name), sets:fitness_workout_sets(*))")
    .eq("id", id)
    .single();
  if (error) throw error;
  return (data as unknown as WorkoutWithExercises | null) ?? null;
}

export async function createSet(input: SetInsert): Promise<SetRow> {
  const { data, error } = await supabase.from("fitness_workout_sets").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function updateSet(id: string, input: SetUpdate): Promise<SetRow> {
  const { data, error } = await supabase
    .from("fitness_workout_sets")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteSet(id: string): Promise<void> {
  const { error } = await supabase.from("fitness_workout_sets").delete().eq("id", id);
  if (error) throw error;
}

export type PreviousExerciseSet = { weight: number | null; reps: number | null };

export async function getPreviousExerciseSets(exerciseId: string): Promise<PreviousExerciseSet[] | null> {
  const { data, error } = await supabase
    .from("fitness_workout_exercises")
    .select("id, workout:fitness_workouts!inner(id, started_at, completed_at)")
    .eq("exercise_id", exerciseId)
    .not("workout.completed_at", "is", null)
    .order("workout(started_at)", { ascending: false })
    .limit(1);
  if (error) throw error;

  type Joined = { id: string };
  const target = (data?.[0] as unknown as Joined | undefined);
  if (!target) return null;

  const { data: sets, error: sError } = await supabase
    .from("fitness_workout_sets")
    .select("weight, reps, set_number")
    .eq("workout_exercise_id", target.id)
    .order("set_number", { ascending: true });
  if (sError) throw sError;

  if ((sets ?? []).length === 0) return null;
  return (sets ?? []).map((s) => ({ weight: s.weight, reps: s.reps }));
}

export async function listCompletedWorkouts(limit = 50): Promise<WorkoutWithExercises[]> {
  const { data, error } = await supabase
    .from("fitness_workouts")
    .select("*, workout_exercises:fitness_workout_exercises(*, exercise:fitness_exercises(id, name), sets:fitness_workout_sets(*))")
    .not("completed_at", "is", null)
    .order("started_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as unknown as WorkoutWithExercises[];
}