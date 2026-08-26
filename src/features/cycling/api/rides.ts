import { supabase } from "../../../lib/supabase/client";
import type { Database } from "../../../types/database";

type RideRow = Database["public"]["Tables"]["fitness_rides"]["Row"];
type RideInsert = Database["public"]["Tables"]["fitness_rides"]["Insert"];

export async function listRides(limit = 100): Promise<RideRow[]> {
  const { data, error } = await supabase
    .from("fitness_rides")
    .select("*")
    .order("started_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function createRide(input: RideInsert): Promise<RideRow> {
  const { data, error } = await supabase.from("fitness_rides").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function deleteRide(id: string): Promise<void> {
  const { error } = await supabase.from("fitness_rides").delete().eq("id", id);
  if (error) throw error;
}