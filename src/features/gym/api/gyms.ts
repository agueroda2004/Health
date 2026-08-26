import { supabase } from "../../../lib/supabase/client";
import type { Database } from "../../../types/database";

type GymRow = Database["public"]["Tables"]["fitness_gyms"]["Row"];
type GymInsert = Database["public"]["Tables"]["fitness_gyms"]["Insert"];
type GymUpdate = Database["public"]["Tables"]["fitness_gyms"]["Update"];

export async function listGyms(): Promise<GymRow[]> {
  const { data, error } = await supabase
    .from("fitness_gyms")
    .select("*")
    .order("gym_nombre", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createGym(input: GymInsert): Promise<GymRow> {
  const { data, error } = await supabase.from("fitness_gyms").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function updateGym(id: string, input: GymUpdate): Promise<GymRow> {
  const { data, error } = await supabase
    .from("fitness_gyms")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteGym(id: string): Promise<void> {
  const { error } = await supabase.from("fitness_gyms").delete().eq("id", id);
  if (error) throw error;
}

export async function hasGymDependencies(id: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("fitness_workouts")
    .select("id")
    .eq("gym_id", id)
    .limit(1);
  if (error) throw error;
  return (data?.length ?? 0) > 0;
}