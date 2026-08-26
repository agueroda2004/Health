import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../auth/hooks/useAuth";
import * as api from "../api/exercises";
import type { Database } from "../../../types/database";

type ExerciseInsert = Database["public"]["Tables"]["fitness_exercises"]["Insert"];

export function useExercises() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["exercises"],
    queryFn: api.listExercises,
    enabled: !!user,
  });
}

export function useExerciseMutations() {
  const qc = useQueryClient();
  const { user } = useAuth();

  const create = useMutation({
    mutationFn: (input: Omit<ExerciseInsert, "user_id">) =>
      api.createExercise({ ...input, user_id: user!.id }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["exercises"] }),
  });

  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Omit<ExerciseInsert, "user_id"> }) =>
      api.updateExercise(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["exercises"] }),
  });

  const remove = useMutation({
    mutationFn: api.deleteExercise,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["exercises"] }),
  });

  return { create, update, remove };
}