import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Bike, ChevronRight, Dumbbell, Footprints, Flame, Play, Target } from "lucide-react";
import { Card } from "../../shared/ui/Card";
import { Button } from "../../shared/ui/Button";
import { ActivityCard } from "../../shared/ui/ActivityCard";
import { StatCard } from "../../shared/ui/StatCard";
import { Skeleton } from "../../shared/ui/Skeleton";
import { EmptyState } from "../../shared/ui/EmptyState";
import { ErrorState } from "../../shared/ui/ErrorState";
import { useDashboardData, relativeDayLabel } from "../../shared/hooks/useDashboardData";
import { useTemplates } from "../gym/hooks/useTemplates";
import { useGyms } from "../gym/hooks/useGyms";
import { useStartWorkout } from "../gym/hooks/useStartWorkout";
import { useWorkoutSessionStore } from "../gym/stores/workoutSessionStore";
import { greeting, formatLongDate, todayISO } from "../../shared/utils/dates";
import { formatDurationShort } from "../../shared/utils/time";
import { useSettingsStore } from "../../shared/hooks/useSettings";
import { fromKm } from "../../shared/utils/units";
import { findScheduledWorkout } from "../../shared/utils/schedule";
import { useAddActivityStore } from "../activities/useAddActivityStore";

export function DashboardPage() {
  const navigate = useNavigate();
  const { data: templates } = useTemplates();
  const { data: gyms } = useGyms();
  const { startFromTemplate, starting } = useStartWorkout();
  const isActive = useWorkoutSessionStore((s) => s.isActive);
  const distanceUnit = useSettingsStore((s) => s.distanceUnit);
  const openAddActivity = useAddActivityStore((s) => s.open);

  const { todayActivities, recent, week, streak, isLoading, isError, refetch } =
    useDashboardData();

  const scheduled = useMemo(
    () => findScheduledWorkout(templates ?? [], new Date()),
    [templates],
  );
  const nextTemplate =
    (scheduled ? templates?.find((t) => t.id === scheduled.template.id) : undefined) ??
    undefined;
  const nextDay =
    (scheduled && nextTemplate
      ? nextTemplate.template_days.find((d) => d.id === scheduled.day.id)
      : undefined) ?? undefined;
  const startDayIndex = scheduled?.dayIndex ?? 0;
  const nextGym = gyms?.[0];

  const stats = useMemo(() => {
    if (!week) return null;
    return [
      { icon: <Dumbbell className="h-5 w-5" />, label: "Gimnasio", value: `${week.gymWorkouts}`, sub: week.gymWorkouts === 1 ? "entrenamiento" : "entrenamientos" },
      { icon: <Footprints className="h-5 w-5" />, label: "Running", value: `${fromKm(week.runKm, distanceUnit).toFixed(1)}`, sub: distanceUnit },
      { icon: <Bike className="h-5 w-5" />, label: "Cycling", value: `${fromKm(week.rideKm, distanceUnit).toFixed(1)}`, sub: distanceUnit },
    ];
  }, [week, distanceUnit]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32" />
        <div className="grid grid-cols-3 gap-3">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      </div>
    );
  }

  if (isError) {
    return <ErrorState onRetry={refetch} />;
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-extrabold text-zinc-800 dark:text-zinc-100">
          {greeting()} 👋
        </h1>
        <p className="text-sm font-medium capitalize text-zinc-400">
          {formatLongDate(todayISO())}
        </p>
      </div>

      {isActive ? (
        <Card className="border-primary-300 bg-primary-50/60 p-4 dark:border-primary-800 dark:bg-primary-950/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-white">
                <Dumbbell className="h-6 w-6" />
              </div>
              <div>
                <p className="font-extrabold text-zinc-800 dark:text-zinc-100">Workout en curso</p>
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Continúa donde lo dejaste</p>
              </div>
            </div>
            <Button size="sm" onClick={() => navigate("/workout")}>
              <Play className="h-4 w-4" />
              Continuar
            </Button>
          </div>
        </Card>
      ) : nextTemplate && nextDay ? (
        <Card className="border-primary-200 bg-gradient-to-br from-primary-50 to-white p-4 dark:border-primary-800 dark:from-primary-950/40 dark:to-zinc-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-primary-600 dark:text-primary-400">
                Today's workout
              </p>
              <h2 className="mt-1 text-xl font-extrabold text-zinc-800 dark:text-zinc-100">
                🏋️ {nextDay.name}
              </h2>
              <p className="mt-0.5 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                {nextTemplate.name} · {nextDay.template_exercises.length} ejercicios
              </p>
            </div>
          </div>
          <Button
            size="lg"
            className="mt-3 w-full"
            disabled={starting}
            onClick={() => void startFromTemplate(nextTemplate, startDayIndex, nextGym?.id ?? null)}
          >
            <Play className="h-5 w-5" />
            {starting ? "Empezando…" : "Start Workout"}
          </Button>
        </Card>
      ) : templates && templates.length === 0 ? (
        <EmptyState
          icon={<Dumbbell className="h-8 w-8" />}
          title="Crea tu primera rutina"
          description="Empieza con Push/Pull/Legs, Upper/Lower o lo que prefieras."
          action={
            <Button onClick={() => navigate("/settings")}>Crear rutina</Button>
          }
        />
      ) : (
        <Card className="border-2 border-dashed border-zinc-200 p-4 dark:border-zinc-700">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
              <Dumbbell className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <p className="font-extrabold text-zinc-800 dark:text-zinc-100">
                Hoy no tienes rutina asignada
              </p>
              <p className="text-xs font-medium text-zinc-400">
                Asigna un día de la semana en tus rutinas o elige manualmente.
              </p>
            </div>
            <Button size="sm" variant="secondary" onClick={() => navigate("/workout")}>
              Elegir
            </Button>
          </div>
        </Card>
      )}

      <div>
        <h2 className="mb-2 text-sm font-extrabold uppercase tracking-wide text-zinc-400">
          Registrar actividad
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => openAddActivity("run")}
            className="flex items-center gap-3 rounded-3xl border-2 border-sky-200 bg-sky-50/60 p-4 text-left transition active:scale-[0.98] dark:border-sky-900 dark:bg-sky-950/30"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-sky-600 dark:bg-sky-900/60 dark:text-sky-300">
              <Footprints className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <p className="font-extrabold text-zinc-800 dark:text-zinc-100">Añadir carrera</p>
              <p className="text-xs font-medium text-zinc-400">Distancia, tiempo y ritmo</p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => openAddActivity("ride")}
            className="flex items-center gap-3 rounded-3xl border-2 border-emerald-200 bg-emerald-50/60 p-4 text-left transition active:scale-[0.98] dark:border-emerald-900 dark:bg-emerald-950/30"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/60 dark:text-emerald-300">
              <Bike className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <p className="font-extrabold text-zinc-800 dark:text-zinc-100">Añadir salida</p>
              <p className="text-xs font-medium text-zinc-400">Distancia, tiempo y velocidad</p>
            </div>
          </button>
        </div>
      </div>

      <div>
        <h2 className="mb-2 text-sm font-extrabold uppercase tracking-wide text-zinc-400">
          This Week
        </h2>
        {stats ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {stats.map((s) => (
              <StatCard key={s.label} icon={s.icon} label={s.label} value={s.value} sub={s.sub} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
        )}
      </div>

      <Card className="flex items-center gap-3 p-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 dark:bg-orange-900/60 dark:text-orange-300">
          <Flame className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <p className="font-extrabold text-zinc-800 dark:text-zinc-100">Training streak</p>
          <p className="text-xs font-medium text-zinc-400">
            {streak.current} días actuales · mejor {streak.best}
          </p>
        </div>
        <span className="text-2xl font-extrabold text-primary">{streak.current}</span>
      </Card>

      <button
        type="button"
        onClick={() => navigate("/goals")}
        className="flex w-full items-center gap-3 rounded-3xl border-2 border-dashed border-primary-300 bg-primary-50/50 p-4 text-left transition active:scale-[0.98] dark:border-primary-800 dark:bg-primary-950/20"
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-100 text-primary-600 dark:bg-primary-900/60 dark:text-primary-300">
          <Target className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <p className="font-extrabold text-zinc-800 dark:text-zinc-100">Tus metas</p>
          <p className="text-xs font-medium text-zinc-400">Revisa y crea objetivos</p>
        </div>
        <ChevronRight className="h-5 w-5 text-zinc-400" />
      </button>

      <div>
        <h2 className="mb-2 text-sm font-extrabold uppercase tracking-wide text-zinc-400">
          Hoy
        </h2>
        {todayActivities.length > 0 ? (
          <div className="space-y-2">
            {todayActivities.map((a) => (
              <ActivityCard
                key={`${a.kind}-${a.id}`}
                kind={a.kind}
                icon={a.kind === "gym" ? <Dumbbell className="h-5 w-5" /> : a.kind === "run" ? <Footprints className="h-5 w-5" /> : <Bike className="h-5 w-5" />}
                title={a.title}
                subtitle={
                  a.kind === "gym"
                    ? `${a.exerciseCount ?? 0} ejercicios · ${formatDurationShort(a.durationSeconds)}`
                    : `${a.distanceKm?.toFixed(2)} km · ${formatDurationShort(a.durationSeconds)}`
                }
              />
            ))}
          </div>
        ) : (
          <Card className="p-4">
            <p className="text-sm font-medium text-zinc-400">
              Aún no has registrado actividad hoy.
            </p>
          </Card>
        )}
      </div>

      {recent.length > 0 && (
        <div>
          <h2 className="mb-2 text-sm font-extrabold uppercase tracking-wide text-zinc-400">
            Recent Activity
          </h2>
          <div className="space-y-2">
            {recent.map((a) => (
              <ActivityCard
                key={`${a.kind}-${a.id}`}
                kind={a.kind}
                icon={a.kind === "gym" ? <Dumbbell className="h-5 w-5" /> : a.kind === "run" ? <Footprints className="h-5 w-5" /> : <Bike className="h-5 w-5" />}
                title={a.title}
                subtitle={
                  a.kind === "gym"
                    ? `${a.exerciseCount ?? 0} ejercicios · ${formatDurationShort(a.durationSeconds)}`
                    : `${a.distanceKm?.toFixed(2)} km · ${formatDurationShort(a.durationSeconds)}`
                }
                right={relativeDayLabel(a.date)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}