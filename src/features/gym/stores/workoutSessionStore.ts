import { create } from "zustand";
import type { Database } from "../../../types/database";

type WorkoutRow = Database["public"]["Tables"]["fitness_workouts"]["Row"];
type SetRow = Database["public"]["Tables"]["fitness_workout_sets"]["Row"];

export type ActiveSet = SetRow;

export type ActiveExercise = {
  workoutExerciseId: string;
  exerciseId: string | null;
  exerciseName: string;
  order: number;
  targetSets: number | null;
  targetReps: string | null;
  restSeconds: number | null;
  previous?: { weight: number | null; reps: number | null }[];
  sets: ActiveSet[];
};

type WorkoutSessionState = {
  workout: WorkoutRow | null;
  exercises: ActiveExercise[];
  isActive: boolean;
  initSession: (workout: WorkoutRow, exercises: ActiveExercise[]) => void;
  upsertSet: (workoutExerciseId: string, set: ActiveSet) => void;
  replaceSet: (workoutExerciseId: string, tempId: string, set: ActiveSet) => void;
  removeSet: (setId: string) => void;
  updateWorkout: (patch: Partial<WorkoutRow>) => void;
  clearSession: () => void;
};

export const useWorkoutSessionStore = create<WorkoutSessionState>((set) => ({
  workout: null,
  exercises: [],
  isActive: false,
  initSession: (workout, exercises) =>
    set({ workout, exercises, isActive: true }),
  upsertSet: (workoutExerciseId, activeSet) =>
    set((state) => {
      const exists = state.exercises.some((e) =>
        e.workoutExerciseId === workoutExerciseId &&
        e.sets.some((s) => s.id === activeSet.id),
      );
      return {
        exercises: state.exercises.map((e) => {
          if (e.workoutExerciseId !== workoutExerciseId) return e;
          if (exists) {
            return {
              ...e,
              sets: e.sets.map((s) => (s.id === activeSet.id ? activeSet : s)),
            };
          }
          return { ...e, sets: [...e.sets, activeSet] };
        }),
      };
    }),
  replaceSet: (workoutExerciseId, tempId, activeSet) =>
    set((state) => ({
      exercises: state.exercises.map((e) => {
        if (e.workoutExerciseId !== workoutExerciseId) return e;
        return {
          ...e,
          sets: e.sets.map((s) => (s.id === tempId ? activeSet : s)),
        };
      }),
    })),
  removeSet: (setId) =>
    set((state) => ({
      exercises: state.exercises.map((e) => ({
        ...e,
        sets: e.sets.filter((s) => s.id !== setId),
      })),
    })),
  updateWorkout: (patch) =>
    set((state) => (state.workout ? { workout: { ...state.workout, ...patch } } : {})),
  clearSession: () => set({ workout: null, exercises: [], isActive: false }),
}));

export function useActiveWorkout() {
  return useWorkoutSessionStore();
}