import { useNavigate } from "react-router-dom";
import { LogOut, Moon, Ruler, Scale, User } from "lucide-react";
import { Card } from "../../shared/ui/Card";
import { Button } from "../../shared/ui/Button";
import { SegmentedControl } from "../../shared/ui/SegmentedControl";
import { useSettingsStore } from "../../shared/hooks/useSettings";
import { useAuth } from "../auth/hooks/useAuth";
import { supabase } from "../../lib/supabase/client";
import { notify } from "../../shared/ui/notify";
import { GymManager } from "../gym/components/GymManager";
import { ExerciseManager } from "../gym/components/ExerciseManager";
import { RoutineManager } from "../gym/components/RoutineManager";

export function SettingsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const weightUnit = useSettingsStore((s) => s.weightUnit);
  const distanceUnit = useSettingsStore((s) => s.distanceUnit);
  const darkMode = useSettingsStore((s) => s.darkMode);
  const setWeightUnit = useSettingsStore((s) => s.setWeightUnit);
  const setDistanceUnit = useSettingsStore((s) => s.setDistanceUnit);
  const toggleDarkMode = useSettingsStore((s) => s.toggleDarkMode);

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/login", { replace: true });
    notify.info("Sesión cerrada");
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-extrabold text-zinc-800 dark:text-zinc-100">Ajustes</h1>
        <p className="text-sm font-medium text-zinc-400">Perfil y preferencias.</p>
      </div>

      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-100 text-primary-600 dark:bg-primary-900/60 dark:text-primary-300">
            <User className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <p className="truncate font-extrabold text-zinc-800 dark:text-zinc-100">
              {user?.email ?? "Usuario"}
            </p>
            <p className="text-xs font-medium text-zinc-400">Fitness · V1</p>
          </div>
        </div>
      </Card>

      <Card className="space-y-4 p-4">
        <h3 className="font-extrabold text-zinc-800 dark:text-zinc-100">Preferencias</h3>

        <div>
          <p className="mb-1.5 flex items-center gap-2 text-sm font-bold text-zinc-600 dark:text-zinc-300">
            <Scale className="h-4 w-4" />
            Peso
          </p>
          <SegmentedControl
            options={[
              { value: "kg", label: "kg" },
              { value: "lb", label: "lb" },
            ]}
            value={weightUnit}
            onChange={setWeightUnit}
          />
        </div>

        <div>
          <p className="mb-1.5 flex items-center gap-2 text-sm font-bold text-zinc-600 dark:text-zinc-300">
            <Ruler className="h-4 w-4" />
            Distancia
          </p>
          <SegmentedControl
            options={[
              { value: "km", label: "km" },
              { value: "miles", label: "millas" },
            ]}
            value={distanceUnit}
            onChange={setDistanceUnit}
          />
        </div>

        <button
          type="button"
          onClick={toggleDarkMode}
          className="flex w-full items-center justify-between rounded-2xl border-2 border-zinc-200 px-4 py-3 transition hover:border-primary-400 dark:border-zinc-700"
        >
          <span className="flex items-center gap-2 text-sm font-bold text-zinc-700 dark:text-zinc-200">
            <Moon className="h-4 w-4" />
            Modo oscuro
          </span>
          <span className={`relative h-6 w-11 rounded-full transition ${darkMode ? "bg-primary" : "bg-zinc-300"}`}>
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${darkMode ? "left-[22px]" : "left-0.5"}`}
            />
          </span>
        </button>
      </Card>

      <RoutineManager />
      <GymManager />
      <ExerciseManager />

      <Card className="p-4">
        <Button variant="danger" className="w-full" onClick={handleLogout}>
          <LogOut className="h-5 w-5" />
          Cerrar sesión
        </Button>
      </Card>
    </div>
  );
}