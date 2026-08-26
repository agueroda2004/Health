import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "./app/AppLayout";
import { LoginPage } from "./features/auth/components/LoginPage";
import { ProtectedRoute } from "./features/auth/components/ProtectedRoute";
import { PublicOnlyRoute } from "./features/auth/components/PublicOnlyRoute";
import { useSessionSync } from "./features/auth/hooks/useSessionSync";
import { WorkoutPage } from "./features/gym/components/WorkoutPage";
import { SettingsPage } from "./features/settings/SettingsPage";
import { DashboardPage } from "./features/dashboard/DashboardPage";
import { HistoryPage } from "./features/history/HistoryPage";
import { StatisticsPage } from "./features/statistics/StatisticsPage";
import { GoalsPage } from "./features/goals/GoalsPage";
import { useSettingsStore, applyDarkMode } from "./shared/hooks/useSettings";
import { ToasterProvider } from "./shared/ui/Toaster";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

function ThemeSync() {
  const darkMode = useSettingsStore((s) => s.darkMode);
  useEffect(() => {
    applyDarkMode(darkMode);
  }, [darkMode]);
  return null;
}

function Shell() {
  useSessionSync();
  return (
    <>
      <ThemeSync />
      <Routes>
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <LoginPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<DashboardPage />} />
          <Route path="/workout" element={<WorkoutPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/statistics" element={<StatisticsPage />} />
          <Route path="/goals" element={<GoalsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Shell />
        <ToasterProvider />
      </BrowserRouter>
    </QueryClientProvider>
  );
}