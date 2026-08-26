import { Dumbbell, History, House, BarChart3, Settings } from "lucide-react";

export const NAV_ITEMS = [
  { to: "/", label: "Home", icon: House, end: true },
  { to: "/workout", label: "Workout", icon: Dumbbell, end: true, primary: true },
  { to: "/history", label: "Historial", icon: History, end: false },
  { to: "/statistics", label: "Stats", icon: BarChart3, end: false },
  { to: "/settings", label: "Ajustes", icon: Settings, end: false },
];