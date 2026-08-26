import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DistanceUnit, WeightUnit } from "../utils/units";

type SettingsState = {
  weightUnit: WeightUnit;
  distanceUnit: DistanceUnit;
  darkMode: boolean;
  setWeightUnit: (unit: WeightUnit) => void;
  setDistanceUnit: (unit: DistanceUnit) => void;
  toggleDarkMode: () => void;
  setDarkMode: (dark: boolean) => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      weightUnit: "kg",
      distanceUnit: "km",
      darkMode: false,
      setWeightUnit: (weightUnit) => set({ weightUnit }),
      setDistanceUnit: (distanceUnit) => set({ distanceUnit }),
      toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),
      setDarkMode: (darkMode) => set({ darkMode }),
    }),
    { name: "fitness-settings" },
  ),
);

export function applyDarkMode(dark: boolean): void {
  const root = document.documentElement;
  if (dark) root.classList.add("dark");
  else root.classList.remove("dark");
}