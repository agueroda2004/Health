import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Bike, ChevronLeft, ChevronRight, Dumbbell, Footprints } from "lucide-react";
import { Card } from "../../shared/ui/Card";
import { ActivityCard } from "../../shared/ui/ActivityCard";
import { Skeleton } from "../../shared/ui/Skeleton";
import { EmptyState } from "../../shared/ui/EmptyState";
import { ErrorState } from "../../shared/ui/ErrorState";
import { ConfirmDialog } from "../../shared/ui/ConfirmDialog";
import { notify } from "../../shared/ui/notify";
import { useDashboardData } from "../../shared/hooks/useDashboardData";
import DatePicker from "../../shared/ui/DatePicker";
import { todayISO, parseISODate, toISODate, formatLongDate } from "../../shared/utils/dates";
import { formatDurationShort } from "../../shared/utils/time";
import { cn } from "../../shared/utils/cn";
import { useSettingsStore } from "../../shared/hooks/useSettings";
import { fromKm } from "../../shared/utils/units";
import { deleteWorkout } from "../gym/api/workouts";
import { deleteRun } from "../running/api/runs";
import { deleteRide } from "../cycling/api/rides";
import type { UnifiedActivity } from "../../shared/types/activity";

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function firstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export function HistoryPage() {
  const { activities, isLoading, isError, refetch } = useDashboardData();
  const distanceUnit = useSettingsStore((s) => s.distanceUnit);
  const queryClient = useQueryClient();

  const initial = parseISODate(todayISO());
  const [selected, setSelected] = useState(todayISO());
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());
  const [deleteTarget, setDeleteTarget] = useState<UnifiedActivity | null>(null);
  const [deleting, setDeleting] = useState(false);

  const activitiesByDate = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const a of activities ?? []) {
      const set = map.get(a.date) ?? new Set<string>();
      set.add(a.kind);
      map.set(a.date, set);
    }
    return map;
  }, [activities]);

  const selectedActivities = (activities ?? []).filter((a) => a.date === selected);

  const days = daysInMonth(viewYear, viewMonth);
  const firstDay = firstDayOfMonth(viewYear, viewMonth);
  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let d = 1; d <= days; d++) calendarDays.push(d);

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  const iconFor = (kind: "gym" | "run" | "ride") =>
    kind === "gym" ? (
      <Dumbbell className="h-5 w-5" />
    ) : kind === "run" ? (
      <Footprints className="h-5 w-5" />
    ) : (
      <Bike className="h-5 w-5" />
    );

  async function handleDelete(activity: UnifiedActivity) {
    setDeleting(true);
    try {
      if (activity.kind === "gym") await deleteWorkout(activity.id);
      else if (activity.kind === "run") await deleteRun(activity.id);
      else await deleteRide(activity.id);
      await queryClient.invalidateQueries({ queryKey: ["activities"] });
      await queryClient.invalidateQueries({ queryKey: ["week-summary"] });
      await queryClient.invalidateQueries({ queryKey: ["statistics"] });
      await queryClient.invalidateQueries({ queryKey: ["runs"] });
      await queryClient.invalidateQueries({ queryKey: ["rides"] });
      await queryClient.invalidateQueries({ queryKey: ["goals"] });
      notify.success("Actividad eliminada");
    } catch {
      notify.error("No se pudo eliminar la actividad.");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-64" />
        <Skeleton className="h-24" />
      </div>
    );
  }

  if (isError) {
    return <ErrorState onRetry={refetch} />;
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-extrabold text-zinc-800 dark:text-zinc-100">Historial</h1>
        <p className="text-sm font-medium text-zinc-400">Tus actividades por día.</p>
      </div>

      <DatePicker
        value={selected}
        onChange={(iso) => {
          setSelected(iso);
          const d = parseISODate(iso);
          setViewYear(d.getFullYear());
          setViewMonth(d.getMonth());
        }}
        maxDate={new Date()}
      />

      <Card className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <button type="button" onClick={prevMonth} className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-100 dark:hover:bg-zinc-800">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-extrabold text-zinc-700 dark:text-zinc-200">
            {viewYear} · {viewMonth + 1}
          </span>
          <button type="button" onClick={nextMonth} className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-100 dark:hover:bg-zinc-800">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-1 grid grid-cols-7 gap-1 text-center">
          {["L", "M", "X", "J", "V", "S", "D"].map((d) => (
            <div key={d} className="text-xs font-bold text-zinc-400">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, i) => {
            if (day === null) return <div key={`e${i}`} />;
            const iso = toISODate(new Date(viewYear, viewMonth, day));
            const kinds = activitiesByDate.get(iso);
            const isSelected = iso === selected;
            return (
              <button
                key={i}
                type="button"
                onClick={() => setSelected(iso)}
                className={cn(
                  "relative flex h-9 items-center justify-center rounded-xl text-sm font-bold transition",
                  isSelected
                    ? "bg-primary text-white"
                    : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800",
                )}
              >
                {day}
                {kinds && kinds.size > 0 && (
                  <span className="absolute bottom-0.5 flex gap-0.5">
                    {[...kinds].map((k) => (
                      <span
                        key={k}
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          isSelected ? "bg-white" : k === "gym" ? "bg-primary" : k === "run" ? "bg-sky-500" : "bg-emerald-500",
                        )}
                      />
                    ))}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </Card>

      <div>
        <h2 className="mb-2 text-sm font-extrabold capitalize text-zinc-400">
          {selected === todayISO() ? "Hoy" : formatLongDate(selected)}
        </h2>
        {selectedActivities.length > 0 ? (
          <div className="space-y-2">
            {selectedActivities.map((a) => (
              <ActivityCard
                key={`${a.kind}-${a.id}`}
                kind={a.kind}
                icon={iconFor(a.kind)}
                title={a.title}
                subtitle={
                  a.kind === "gym"
                    ? `${a.exerciseCount ?? 0} ejercicios · ${formatDurationShort(a.durationSeconds)}`
                    : `${fromKm(a.distanceKm ?? 0, distanceUnit).toFixed(2)} ${distanceUnit} · ${formatDurationShort(a.durationSeconds)}`
                }
                onDelete={() => setDeleteTarget(a)}
                deleting={deleting && deleteTarget?.id === a.id}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Dumbbell className="h-6 w-6" />}
            title="Sin actividad"
            description="No hay entrenamientos registrados este día."
          />
        )}
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Eliminar actividad"
        message={`¿Seguro que quieres eliminar esta ${deleteTarget?.kind === "gym" ? "sesión" : "actividad"}? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        tone="danger"
        loading={deleting}
        onConfirm={() => deleteTarget && void handleDelete(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}