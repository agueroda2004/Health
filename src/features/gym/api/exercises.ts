import { supabase } from "../../../lib/supabase/client";
import type { Database } from "../../../types/database";

type ExerciseRow = Database["public"]["Tables"]["fitness_exercises"]["Row"];
type ExerciseInsert = Database["public"]["Tables"]["fitness_exercises"]["Insert"];
type ExerciseUpdate = Database["public"]["Tables"]["fitness_exercises"]["Update"];

export async function listExercises(): Promise<ExerciseRow[]> {
  const { data, error } = await supabase
    .from("fitness_exercises")
    .select("*")
    .order("name", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createExercise(input: ExerciseInsert): Promise<ExerciseRow> {
  const { data, error } = await supabase.from("fitness_exercises").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function updateExercise(id: string, input: ExerciseUpdate): Promise<ExerciseRow> {
  const { data, error } = await supabase
    .from("fitness_exercises")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteExercise(id: string): Promise<void> {
  const { error } = await supabase.from("fitness_exercises").delete().eq("id", id);
  if (error) throw error;
}

export async function hasExerciseDependencies(id: string): Promise<boolean> {
  const template = await supabase
    .from("fitness_workout_template_exercises")
    .select("id")
    .eq("exercise_id", id)
    .limit(1);
  const workout = await supabase
    .from("fitness_workout_exercises")
    .select("id")
    .eq("exercise_id", id)
    .limit(1);
  const pr = await supabase
    .from("fitness_personal_records")
    .select("id")
    .eq("exercise_id", id)
    .limit(1);
  if (template.error) throw template.error;
  if (workout.error) throw workout.error;
  if (pr.error) throw pr.error;
  return (
    (template.data?.length ?? 0) > 0 ||
    (workout.data?.length ?? 0) > 0 ||
    (pr.data?.length ?? 0) > 0
  );
}