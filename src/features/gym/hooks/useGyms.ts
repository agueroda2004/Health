import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../auth/hooks/useAuth";
import * as api from "../api/gyms";
import type { Database } from "../../../types/database";

type GymInsert = Database["public"]["Tables"]["fitness_gyms"]["Insert"];

export function useGyms() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["gyms"],
    queryFn: api.listGyms,
    enabled: !!user,
  });
}

export function useGymMutations() {
  const qc = useQueryClient();
  const { user } = useAuth();

  const create = useMutation({
    mutationFn: (input: Omit<GymInsert, "user_id">) =>
      api.createGym({ ...input, user_id: user!.id }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["gyms"] }),
  });

  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Omit<GymInsert, "user_id"> }) =>
      api.updateGym(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["gyms"] }),
  });

  const remove = useMutation({
    mutationFn: api.deleteGym,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["gyms"] }),
  });

  return { create, update, remove };
}