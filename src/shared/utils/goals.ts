export type GoalProgress = {
  progress: number;
  progressPct: number;
  remaining: number;
  isComplete: boolean;
};

export function goalProgress(current: number, target: number): GoalProgress {
  const t = target > 0 ? target : 0;
  const progress = Math.min(current, t);
  const progressPct = t > 0 ? Math.min(100, (current / t) * 100) : 0;
  const remaining = Math.max(0, t - current);
  const isComplete = t > 0 && current >= t;
  return { progress, progressPct, remaining, isComplete };
}