export function formatDuration(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  }
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

export function formatDurationShort(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m} min`;
  return `${sec} s`;
}

export function parseDurationInput(input: string): number | null {
  const parts = input.trim().split(":");
  if (parts.length === 1) {
    const secs = Number(parts[0]);
    return Number.isFinite(secs) && secs >= 0 ? Math.round(secs) : null;
  }
  const nums = parts.map((p) => Number(p.trim()));
  if (nums.some((n) => !Number.isFinite(n) || n < 0)) return null;
  let total: number;
  if (nums.length === 2) total = nums[0] * 60 + nums[1];
  else if (nums.length === 3) total = nums[0] * 3600 + nums[1] * 60 + nums[2];
  else return null;
  return Math.round(total);
}