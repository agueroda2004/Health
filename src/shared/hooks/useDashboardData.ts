import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { fetchUnifiedActivities, fetchWeekSummary } from "../../lib/activities";
import { currentStreak, bestStreak } from "../utils/streak";
import type { UnifiedActivity } from "../types/activity";
import { toISODate, addDaysISO, isSameDay } from "../utils/dates";

export function useDashboardData() {
  const { user } = useAuth();

  const activities = useQuery({
    queryKey: ["activities"],
    queryFn: fetchUnifiedActivities,
    enabled: !!user,
  });

  const week = useQuery({
    queryKey: ["week-summary"],
    queryFn: fetchWeekSummary,
    enabled: !!user,
  });

  const dates = activities.data?.map((a) => a.date) ?? [];
  const streak = user
    ? { current: currentStreak(dates), best: bestStreak(dates) }
    : { current: 0, best: 0 };

  const today = toISODate(new Date());
  const todayActivities: UnifiedActivity[] = (activities.data ?? []).filter(
    (a) => a.date === today,
  );

  const recent = (activities.data ?? [])
    .filter((a) => a.date !== today)
    .slice(0, 8);

  return {
    activities: activities.data,
    todayActivities,
    recent,
    week: week.data,
    streak,
    isLoading: activities.isLoading || week.isLoading,
    isError: activities.isError || week.isError,
    refetch: () => {
      void activities.refetch();
      void week.refetch();
    },
  };
}

export function relativeDayLabel(iso: string): string {
  const today = toISODate(new Date());
  if (iso === today) return "Hoy";
  if (iso === addDaysISO(today, -1)) return "Ayer";
  return iso;
}

export function isRecentDate(iso: string, reference: Date): boolean {
  return isSameDay(new Date(`${iso}T00:00:00`), reference);
}