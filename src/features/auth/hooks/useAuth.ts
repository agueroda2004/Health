import { useAuthStore } from "../stores/authStore";

export function useAuth() {
  const session = useAuthStore((s) => s.session);
  const user = useAuthStore((s) => s.user);
  const isInitialized = useAuthStore((s) => s.isInitialized);
  return { session, user, isInitialized };
}