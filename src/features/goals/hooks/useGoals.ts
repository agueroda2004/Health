import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../auth/hooks/useAuth";
import { supabase } from "../../../lib/supabase/client";
import * as api from "../api/goals";
import type { Database } from "../../../types/database";
import { parseISODate, toISODate } from "../../../shared/utils/dates";

type GoalInsert = Database["public"]["Tables"]["fitness_goals"]["Insert"];

async function computeCurrentValue(
  userId: string,
  goal: { id: string; type: string; activity_type: string; start_date: string; end_date: string | null; target_value: number },
): Promise<number> {
  const start = toISODate(parseISODate(goal.start_date));
  const end = goal.end_date ?? toISODate(new Date());
  const gte = `${start}T00:00:00`;
  const lte = `${end}T23:59:59`;

  let current = 0;

  if (goal.activity_type === "gym") {
    const { data, error } = await supabase
      .from("fitness_workouts")
      .select("id")
      .eq("user_id", userId)
      .not("completed_at", "is", null)
      .gte("started_at", gte)
      .lte("started_at", lte);
    if (error) throw error;
    current = data?.length ?? 0;
  } else if (goal.activity_type === "run") {
    const { data, error } = await supabase
      .from("fitness_runs")
      .select("duration_seconds, distance_km")
      .eq("user_id", userId)
      .gte("started_at", gte)
      .lte("started_at", lte);
    if (error) throw error;
    if (goal.type === "distance") {
      current = (data ?? []).reduce((s, r) => s + (r.distance_km ?? 0), 0);
    } else if (goal.type === "time") {
      current = (data ?? []).reduce((s, r) => s + (r.duration_seconds ?? 0), 0) / 3600;
    } else if (goal.type === "workouts") {
      current = data?.length ?? 0;
    }
  } else if (goal.activity_type === "ride") {
    const { data, error } = await supabase
      .from("fitness_rides")
      .select("duration_seconds, distance_km")
      .eq("user_id", userId)
      .gte("started_at", gte)
      .lte("started_at", lte);
    if (error) throw error;
    if (goal.type === "distance") {
      current = (data ?? []).reduce((s, r) => s + (r.distance_km ?? 0), 0);
    } else if (goal.type === "time") {
      current = (data ?? []).reduce((s, r) => s + (r.duration_seconds ?? 0), 0) / 3600;
    } else if (goal.type === "workouts") {
      current = data?.length ?? 0;
    }
  } else {
    // general
    const workoutRes = await supabase
      .from("fitness_workouts")
      .select("id")
      .eq("user_id", userId)
      .not("completed_at", "is", null)
      .gte("started_at", gte)
      .lte("started_at", lte);
    const runRes = await supabase
      .from("fitness_runs")
      .select("id")
      .eq("user_id", userId)
      .gte("started_at", gte)
      .lte("started_at", lte);
    const rideRes = await supabase
      .from("fitness_rides")
      .select("id")
      .eq("user_id", userId)
      .gte("started_at", gte)
      .lte("started_at", lte);
    if (workoutRes.error) throw workoutRes.error;
    if (runRes.error) throw runRes.error;
    if (rideRes.error) throw rideRes.error;
    current =
      (workoutRes.data?.length ?? 0) + (runRes.data?.length ?? 0) + (rideRes.data?.length ?? 0);
  }

  return current;
}

export function useGoals() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["goals"],
    queryFn: async () => {
      const goals = await api.listGoals();
      const withProgress = await Promise.all(
        goals.map(async (g) => {
          try {
            const current = await computeCurrentValue(user!.id, g);
            return { ...g, current_value: current };
          } catch {
            return g;
          }
        }),
      );
      return withProgress;
    },
    enabled: !!user,
  });
}

export function useGoalMutations() {
  const qc = useQueryClient();
  const { user } = useAuth();

  const invalidate = () => qc.invalidateQueries({ queryKey: ["goals"] });

  const create = useMutation({
    mutationFn: (input: Omit<GoalInsert, "user_id">) =>
      api.createGoal({ ...input, user_id: user!.id }),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<GoalInsert> }) =>
      api.updateGoal(id, input),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: api.deleteGoal,
    onSuccess: invalidate,
  });

  return { create, update, remove };
}