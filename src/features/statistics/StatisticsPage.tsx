import { useState } from "react";
import { Bike, Dumbbell, Flame, Footprints, Trophy } from "lucide-react";
import { Card } from "../../shared/ui/Card";
import { StatCard } from "../../shared/ui/StatCard";
import { SegmentedControl } from "../../shared/ui/SegmentedControl";
import { Skeleton } from "../../shared/ui/Skeleton";
import { ErrorState } from "../../shared/ui/ErrorState";
import { useStatistics } from "../../shared/hooks/useStatistics";
import { formatDurationShort } from "../../shared/utils/time";
import { formatPace, formatSpeedKmh } from "../../shared/utils/pace";
import type { DateFilter } from "../../shared/types/activity";
import { useSettingsStore } from "../../shared/hooks/useSettings";
import { fromKm } from "../../shared/utils/units";

const FILTERS: { value: DateFilter; label: string }[] = [
  { value: "7d", label: "7 días" },
  { value: "30d", label: "30 días" },
  { value: "3m", label: "3 meses" },
  { value: "year", label: "Año" },
  { value: "all", label: "Todo" },
];

export function StatisticsPage() {
  const [filter, setFilter] = useState<DateFilter>("30d");
  const { data, isLoading, isError, refetch } = useStatistics(filter);
  const distanceUnit = useSettingsStore((s) => s.distanceUnit);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-extrabold text-zinc-800 dark:text-zinc-100">Estadísticas</h1>
        <p className="text-sm font-medium text-zinc-400">Tu progreso en números.</p>
      </div>

      <SegmentedControl options={FILTERS} value={filter} onChange={setFilter} />

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : data ? (
        <>
          <div>
            <h2 className="mb-2 text-sm font-extrabold uppercase tracking-wide text-zinc-400">General</h2>
            <div className="grid grid-cols-2 gap-3">
              <StatCard icon={<Dumbbell className="h-5 w-5" />} label="Workouts" value={data.workouts} />
              <StatCard icon={<Flame className="h-5 w-5" />} label="Tiempo total" value={formatDurationShort(data.totalTimeSeconds)} />
              <StatCard icon={<Flame className="h-5 w-5" />} label="Racha actual" value={data.currentStreak} sub="días" />
              <StatCard icon={<Trophy className="h-5 w-5" />} label="Mejor racha" value={data.bestStreak} sub="días" />
            </div>
          </div>

          <div>
            <h2 className="mb-2 text-sm font-extrabold uppercase tracking-wide text-zinc-400">Gimnasio</h2>
            <div className="grid grid-cols-2 gap-3">
              <StatCard icon={<Dumbbell className="h-5 w-5" />} label="Workouts" value={data.gym.workouts} />
              <StatCard icon={<Dumbbell className="h-5 w-5" />} label="Series" value={data.gym.totalSets} />
              <StatCard icon={<Dumbbell className="h-5 w-5" />} label="Volumen" value={`${data.gym.totalVolume.toFixed(0)} kg`} sub="total levantado" />
              <StatCard icon={<Trophy className="h-5 w-5" />} label="PRs" value={data.gym.prs.length} />
            </div>

            {data.gym.muscleGroups.length > 0 && (
              <Card className="mt-3 p-4">
                <p className="mb-2 text-sm font-extrabold text-zinc-700 dark:text-zinc-200">Grupos musculares</p>
                <div className="space-y-2">
                  {data.gym.muscleGroups.slice(0, 6).map((mg) => (
                    <div key={mg.name} className="flex items-center justify-between text-sm">
                      <span className="font-bold text-zinc-600 dark:text-zinc-300">{mg.name}</span>
                      <span className="font-extrabold text-primary">{mg.count}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {data.gym.prs.length > 0 && (
              <Card className="mt-3 p-4">
                <p className="mb-2 text-sm font-extrabold text-zinc-700 dark:text-zinc-200">Personal Records</p>
                <div className="space-y-1.5">
                  {data.gym.prs.slice(0, 10).map((p, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="font-bold text-zinc-600 dark:text-zinc-300">{p.exercise}</span>
                      <span className="font-extrabold text-primary">
                        {p.weight ?? "–"} kg × {p.reps ?? "–"}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          <div>
            <h2 className="mb-2 text-sm font-extrabold uppercase tracking-wide text-zinc-400">Running</h2>
            <div className="grid grid-cols-2 gap-3">
              <StatCard icon={<Footprints className="h-5 w-5" />} label="Distancia" value={`${fromKm(data.running.distanceKm, distanceUnit).toFixed(1)}`} sub={distanceUnit} />
              <StatCard icon={<Footprints className="h-5 w-5" />} label="Tiempo" value={formatDurationShort(data.running.timeSeconds)} />
              <StatCard icon={<Footprints className="h-5 w-5" />} label="Ritmo medio" value={formatPace(data.running.avgPace)} />
              <StatCard icon={<Footprints className="h-5 w-5" />} label="Carrera más larga" value={`${fromKm(data.running.longestKm, distanceUnit).toFixed(1)}`} sub={distanceUnit} />
            </div>
          </div>

          <div>
            <h2 className="mb-2 text-sm font-extrabold uppercase tracking-wide text-zinc-400">Cycling</h2>
            <div className="grid grid-cols-2 gap-3">
              <StatCard icon={<Bike className="h-5 w-5" />} label="Distancia" value={`${fromKm(data.cycling.distanceKm, distanceUnit).toFixed(1)}`} sub={distanceUnit} />
              <StatCard icon={<Bike className="h-5 w-5" />} label="Tiempo" value={formatDurationShort(data.cycling.timeSeconds)} />
              <StatCard icon={<Bike className="h-5 w-5" />} label="Vel. media" value={formatSpeedKmh(data.cycling.avgSpeed)} />
              <StatCard icon={<Bike className="h-5 w-5" />} label="Elevación" value={`${data.cycling.elevationGain.toFixed(0)} m`} />
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}