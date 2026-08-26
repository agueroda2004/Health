import { supabase } from "../../../lib/supabase/client";
import type { Database } from "../../../types/database";

type RunRow = Database["public"]["Tables"]["fitness_runs"]["Row"];
type RunInsert = Database["public"]["Tables"]["fitness_runs"]["Insert"];

export async function listRuns(limit = 100): Promise<RunRow[]> {
  const { data, error } = await supabase
    .from("fitness_runs")
    .select("*")
    .order("started_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function createRun(input: RunInsert): Promise<RunRow> {
  const { data, error } = await supabase.from("fitness_runs").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function deleteRun(id: string): Promise<void> {
  const { error } = await supabase.from("fitness_runs").delete().eq("id", id);
  if (error) throw error;
}