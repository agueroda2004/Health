export type ActivityKind = "gym" | "run" | "ride";

export type UnifiedActivity = {
  id: string;
  kind: ActivityKind;
  title: string;
  date: string;
  durationSeconds: number;
  distanceKm?: number;
  volume?: number;
  exerciseCount?: number;
};

export type WeekSummary = {
  gymWorkouts: number;
  runKm: number;
  rideKm: number;
};

export type DateFilter = "7d" | "30d" | "3m" | "year" | "all";