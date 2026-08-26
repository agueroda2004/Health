export function computePace(durationSeconds: number, distanceKm: number): number | null {
  if (distanceKm <= 0 || durationSeconds <= 0) return null;
  return durationSeconds / distanceKm;
}

export function formatPace(paceSecondsPerKm: number | null): string {
  if (paceSecondsPerKm === null || !Number.isFinite(paceSecondsPerKm)) return "–";
  const total = Math.round(paceSecondsPerKm);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")} /km`;
}

export function computeAvgSpeedKmh(durationSeconds: number, distanceKm: number): number | null {
  if (durationSeconds <= 0) return null;
  return (distanceKm / durationSeconds) * 3600;
}

export function formatSpeedKmh(speedKmh: number | null): string {
  if (speedKmh === null || !Number.isFinite(speedKmh)) return "–";
  return `${speedKmh.toFixed(1)} km/h`;
}