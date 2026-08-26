import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../auth/hooks/useAuth";
import * as api from "../api/rides";
import type { Database } from "../../../types/database";

type RideInsert = Database["public"]["Tables"]["fitness_rides"]["Insert"];

export function useRides() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["rides"],
    queryFn: () => api.listRides(),
    enabled: !!user,
  });
}

export function useRideMutations() {
  const qc = useQueryClient();
  const { user } = useAuth();

  const invalidate = () => qc.invalidateQueries({ queryKey: ["rides"] });

  const create = useMutation({
    mutationFn: (input: Omit<RideInsert, "user_id">) =>
      api.createRide({ ...input, user_id: user!.id }),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: api.deleteRide,
    onSuccess: invalidate,
  });

  return { create, remove };
}