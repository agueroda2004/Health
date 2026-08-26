import { supabase } from "../../../lib/supabase/client";
import type { Database } from "../../../types/database";

type GoalRow = Database["public"]["Tables"]["fitness_goals"]["Row"];
type GoalInsert = Database["public"]["Tables"]["fitness_goals"]["Insert"];
type GoalUpdate = Database["public"]["Tables"]["fitness_goals"]["Update"];

export async function listGoals(): Promise<GoalRow[]> {
  const { data, error } = await supabase
    .from("fitness_goals")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createGoal(input: GoalInsert): Promise<GoalRow> {
  const { data, error } = await supabase.from("fitness_goals").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function updateGoal(id: string, input: GoalUpdate): Promise<GoalRow> {
  const { data, error } = await supabase
    .from("fitness_goals")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteGoal(id: string): Promise<void> {
  const { error } = await supabase.from("fitness_goals").delete().eq("id", id);
  if (error) throw error;
}