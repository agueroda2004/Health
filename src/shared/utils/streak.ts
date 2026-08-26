import { parseISODate, toISODate } from "./dates";

function normalizeDates(dates: string[]): string[] {
  return [...new Set(dates.map((d) => toISODate(parseISODate(d))))].sort();
}

export function currentStreak(activityDates: string[]): number {
  const unique = normalizeDates(activityDates);
  if (unique.length === 0) return 0;

  const today = toISODate(new Date());
  const yesterday = toISODate(new Date(Date.now() - 86400000));
  const last = unique[unique.length - 1];

  if (last !== today && last !== yesterday) return 0;

  const set = new Set(unique);
  let cursor = last;
  let count = 0;
  while (set.has(cursor)) {
    count += 1;
    cursor = toISODate(new Date(parseISODate(cursor).getTime() - 86400000));
  }
  return count;
}

export function bestStreak(activityDates: string[]): number {
  const unique = normalizeDates(activityDates);
  if (unique.length === 0) return 0;

  let best = 1;
  let run = 1;
  for (let i = 1; i < unique.length; i++) {
    const prev = parseISODate(unique[i - 1]);
    const curr = parseISODate(unique[i]);
    const gap = Math.round((curr.getTime() - prev.getTime()) / 86400000);
    if (gap === 1) {
      run += 1;
      if (run > best) best = run;
    } else {
      run = 1;
    }
  }
  return best;
}