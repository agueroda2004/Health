export type PRCandidate = {
  weight: number | null;
  reps: number | null;
  completed: boolean;
  isWarmup: boolean;
};

export type PRResult = {
  weight: number;
  reps: number;
  isWeightPR: boolean;
  isRepsPR: boolean;
};

const EPS = 1e-9;

export function evaluatePR(
  set: PRCandidate,
  currentBest: { weight: number; reps: number } | null,
): PRResult {
  const weight = set.weight ?? 0;
  const reps = set.reps ?? 0;

  if (!set.completed || set.isWarmup || weight <= 0 || reps <= 0) {
    return { weight, reps, isWeightPR: false, isRepsPR: false };
  }

  const isWeightPR = !currentBest || weight > currentBest.weight + EPS;
  const sameWeight = currentBest && Math.abs(weight - currentBest.weight) < EPS;
  const isRepsPR =
    (currentBest && (sameWeight ? reps > currentBest.reps : false)) || false;

  return { weight, reps, isWeightPR, isRepsPR };
}

export type WeightedBest = {
  weight: number;
  reps: number;
};

export function computeBest(sets: PRCandidate[]): WeightedBest | null {
  let best: WeightedBest | null = null;
  for (const set of sets) {
    const weight = set.weight ?? 0;
    const reps = set.reps ?? 0;
    if (!set.completed || set.isWarmup || weight <= 0 || reps <= 0) continue;
    if (!best || weight > best.weight) {
      best = { weight, reps };
    } else if (Math.abs(weight - best.weight) < EPS && reps > best.reps) {
      best = { weight, reps };
    }
  }
  return best;
}