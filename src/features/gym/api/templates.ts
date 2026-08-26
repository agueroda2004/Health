import { supabase } from "../../../lib/supabase/client";
import type { Database } from "../../../types/database";

type TemplateRow = Database["public"]["Tables"]["fitness_workout_templates"]["Row"];
type TemplateInsert = Database["public"]["Tables"]["fitness_workout_templates"]["Insert"];
type TemplateUpdate = Database["public"]["Tables"]["fitness_workout_templates"]["Update"];
type DayRow = Database["public"]["Tables"]["fitness_workout_template_days"]["Row"];
type DayInsert = Database["public"]["Tables"]["fitness_workout_template_days"]["Insert"];
type TemplateExerciseRow = Database["public"]["Tables"]["fitness_workout_template_exercises"]["Row"];
type TemplateExerciseInsert = Database["public"]["Tables"]["fitness_workout_template_exercises"]["Insert"];

export type TemplateWithDays = TemplateRow & {
  template_days: (DayRow & {
    template_exercises: (TemplateExerciseRow & { exercise?: { id: string; name: string } | null })[];
  })[];
};

export async function listTemplates(): Promise<TemplateWithDays[]> {
  const { data, error } = await supabase
    .from("fitness_workout_templates")
    .select(
      "*, template_days:fitness_workout_template_days(*, template_exercises:fitness_workout_template_exercises(*, exercise:fitness_exercises(id, name)))",
    )
    .is("archived_at", null)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as TemplateWithDays[];
}

export async function createTemplate(input: TemplateInsert): Promise<TemplateRow> {
  const { data, error } = await supabase
    .from("fitness_workout_templates")
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateTemplate(id: string, input: TemplateUpdate): Promise<TemplateRow> {
  const { data, error } = await supabase
    .from("fitness_workout_templates")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteTemplate(id: string): Promise<void> {
  const { error } = await supabase.from("fitness_workout_templates").delete().eq("id", id);
  if (error) throw error;
}

export async function createDay(input: DayInsert): Promise<DayRow> {
  const { data, error } = await supabase
    .from("fitness_workout_template_days")
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateDay(id: string, input: Partial<DayInsert>): Promise<DayRow> {
  const { data, error } = await supabase
    .from("fitness_workout_template_days")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteDay(id: string): Promise<void> {
  const { error } = await supabase.from("fitness_workout_template_days").delete().eq("id", id);
  if (error) throw error;
}

export async function addTemplateExercise(input: TemplateExerciseInsert): Promise<TemplateExerciseRow> {
  const { data, error } = await supabase
    .from("fitness_workout_template_exercises")
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateTemplateExercise(
  id: string,
  input: Partial<TemplateExerciseInsert>,
): Promise<TemplateExerciseRow> {
  const { data, error } = await supabase
    .from("fitness_workout_template_exercises")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteTemplateExercise(id: string): Promise<void> {
  const { error } = await supabase
    .from("fitness_workout_template_exercises")
    .delete()
    .eq("id", id);
  if (error) throw error;
}