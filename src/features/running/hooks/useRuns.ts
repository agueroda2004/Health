import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../auth/hooks/useAuth";
import * as api from "../api/runs";
import type { Database } from "../../../types/database";

type RunInsert = Database["public"]["Tables"]["fitness_runs"]["Insert"];

export function useRuns() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["runs"],
    queryFn: () => api.listRuns(),
    enabled: !!user,
  });
}

export function useRunMutations() {
  const qc = useQueryClient();
  const { user } = useAuth();

  const invalidate = () => qc.invalidateQueries({ queryKey: ["runs"] });

  const create = useMutation({
    mutationFn: (input: Omit<RunInsert, "user_id">) =>
      api.createRun({ ...input, user_id: user!.id }),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: api.deleteRun,
    onSuccess: invalidate,
  });

  return { create, remove };
}