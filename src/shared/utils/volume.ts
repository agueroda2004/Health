export type SetRecord = {
  weight: number | null;
  reps: number | null;
  completed: boolean;
  isWarmup: boolean;
};

export function setVolume(set: SetRecord): number {
  if (!set.completed || set.isWarmup) return 0;
  const w = set.weight ?? 0;
  const r = set.reps ?? 0;
  return w * r;
}

export function workoutVolume(sets: SetRecord[]): number {
  return sets.reduce((sum, s) => sum + setVolume(s), 0);
}

export function totalSets(sets: SetRecord[]): number {
  return sets.filter((s) => s.completed && !s.isWarmup).length;
}