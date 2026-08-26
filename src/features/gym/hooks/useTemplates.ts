import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../auth/hooks/useAuth";
import * as api from "../api/templates";
import type { Database } from "../../../types/database";

type TemplateInsert = Database["public"]["Tables"]["fitness_workout_templates"]["Insert"];
type DayInsert = Database["public"]["Tables"]["fitness_workout_template_days"]["Insert"];
type TemplateExerciseInsert =
  Database["public"]["Tables"]["fitness_workout_template_exercises"]["Insert"];

export function useTemplates() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["templates"],
    queryFn: api.listTemplates,
    enabled: !!user,
  });
}

export function useTemplateMutations() {
  const qc = useQueryClient();
  const { user } = useAuth();

  const invalidate = () => qc.invalidateQueries({ queryKey: ["templates"] });

  const create = useMutation({
    mutationFn: (input: Omit<TemplateInsert, "user_id">) =>
      api.createTemplate({ ...input, user_id: user!.id }),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Omit<TemplateInsert, "user_id"> }) =>
      api.updateTemplate(id, input),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: api.deleteTemplate,
    onSuccess: invalidate,
  });

  const addDay = useMutation({
    mutationFn: (input: Omit<DayInsert, "user_id">) => api.createDay(input),
    onSuccess: invalidate,
  });

  const editDay = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<DayInsert> }) =>
      api.updateDay(id, input),
    onSuccess: invalidate,
  });

  const removeDay = useMutation({
    mutationFn: api.deleteDay,
    onSuccess: invalidate,
  });

  const addExercise = useMutation({
    mutationFn: (input: Omit<TemplateExerciseInsert, "user_id">) => api.addTemplateExercise(input),
    onSuccess: invalidate,
  });

  const editExercise = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<TemplateExerciseInsert> }) =>
      api.updateTemplateExercise(id, input),
    onSuccess: invalidate,
  });

  const removeExercise = useMutation({
    mutationFn: api.deleteTemplateExercise,
    onSuccess: invalidate,
  });

  return {
    create,
    update,
    remove,
    addDay,
    editDay,
    removeDay,
    addExercise,
    editExercise,
    removeExercise,
  };
}