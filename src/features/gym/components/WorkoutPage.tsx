import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dumbbell, Play, Sparkles, Trophy } from "lucide-react";
import { Button } from "../../../shared/ui/Button";
import { Card } from "../../../shared/ui/Card";
import { EmptyState } from "../../../shared/ui/EmptyState";
import { Skeleton } from "../../../shared/ui/Skeleton";
import { Modal } from "../../../shared/ui/Modal";
import { Field } from "../../../shared/ui/Field";
import { Select } from "../../../shared/ui/Select";
import { useTemplates } from "../hooks/useTemplates";
import { useGyms } from "../hooks/useGyms";
import { useStartWorkout } from "../hooks/useStartWorkout";
import { useWorkoutSessionStore } from "../stores/workoutSessionStore";
import { ExerciseCard } from "../components/ExerciseCard";
import { useFinishWorkout } from "../hooks/useFinishWorkout";

export function WorkoutPage() {
  const navigate = useNavigate();
  const { exercises, workout, isActive } = useWorkoutSessionStore();
  const { data: templates, isLoading: loadingTemplates } = useTemplates();
  const { data: gyms } = useGyms();
  const { startFromTemplate, startFreeWorkout, starting } = useStartWorkout();
  const { finishWorkout, finishing } = useFinishWorkout();

  const [showStart, setShowStart] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [selectedDay, setSelectedDay] = useState<number>(0);
  const [gymId, setGymId] = useState<string>("");

  if (isActive && workout) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-zinc-800 dark:text-zinc-100">
              Today's Workout
            </h1>
            <p className="text-sm font-medium text-zinc-400">
              {workout.template_day_id ? "Rutina" : "Entrenamiento libre"}
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => void finishWorkout()} disabled={finishing}>
            {finishing ? "Finalizando…" : "Finalizar"}
          </Button>
        </div>

        {exercises.length === 0 ? (
          <EmptyState
            icon={<Dumbbell className="h-8 w-8" />}
            title="Sin ejercicios aún"
            description="Este entrenamiento no tiene ejercicios. Registra tu primera serie."
          />
        ) : (
          exercises.map((ex) => <ExerciseCard key={ex.workoutExerciseId} exercise={ex} />)
        )}

        <Button
          size="lg"
          className="w-full"
          onClick={() => void finishWorkout()}
          disabled={finishing}
        >
          <Trophy className="h-5 w-5" />
          {finishing ? "Finalizando…" : "Finish Workout"}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-extrabold text-zinc-800 dark:text-zinc-100">Workout</h1>
        <p className="text-sm font-medium text-zinc-400">Empieza tu entrenamiento de hoy.</p>
      </div>

      {loadingTemplates ? (
        <div className="space-y-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      ) : templates && templates.length > 0 ? (
        <div className="space-y-3">
          {templates.map((tpl) => (
            <Card key={tpl.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-zinc-800 dark:text-zinc-100">{tpl.name}</h3>
                  <p className="text-xs font-medium text-zinc-400">
                    {tpl.template_days.length} días
                    {tpl.description ? ` · ${tpl.description}` : ""}
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedTemplate(tpl.id);
                    setShowStart(true);
                  }}
                >
                  <Play className="h-4 w-4" />
                  Empezar
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Dumbbell className="h-8 w-8" />}
          title="No tienes rutinas"
          description="Crea tu primera rutina para empezar a entrenar."
          action={
            <Button onClick={() => navigate("/settings")}>
              <Sparkles className="h-4 w-4" />
              Crear rutina
            </Button>
          }
        />
      )}

      <Button variant="secondary" className="w-full" onClick={() => void startFreeWorkout(gymId || null)} disabled={starting}>
        Entrenamiento libre
      </Button>

      <Modal open={showStart} onClose={() => setShowStart(false)} title="Empezar entrenamiento">
        <div className="space-y-4">
          <Field label="Rutina">
            <Select
              value={selectedTemplate}
              onChange={(v) => setSelectedTemplate(v)}
            >
              {templates?.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Día">
            <Select value={String(selectedDay)} onChange={(v) => setSelectedDay(Number(v))}>
              {templates
                ?.find((t) => t.id === selectedTemplate)
                ?.template_days.map((d, i) => (
                  <option key={d.id} value={i}>
                    {d.name}
                  </option>
                ))}
            </Select>
          </Field>

          {gyms && gyms.length > 0 && (
            <Field label="Gimnasio (opcional)">
              <Select value={gymId} onChange={(v) => setGymId(v)}>
                <option value="">Sin gimnasio</option>
                {gyms.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.gym_nombre}
                  </option>
                ))}
              </Select>
            </Field>
          )}

          <Button
            size="lg"
            className="w-full"
            disabled={!selectedTemplate || starting}
            onClick={() => {
              const tpl = templates?.find((t) => t.id === selectedTemplate);
              if (tpl) void startFromTemplate(tpl, selectedDay, gymId || null);
            }}
          >
            <Play className="h-5 w-5" />
            Empezar
          </Button>
        </div>
      </Modal>
    </div>
  );
}