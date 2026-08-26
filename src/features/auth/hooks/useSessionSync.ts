import { useEffect } from "react";
import { supabase } from "../../../lib/supabase/client";
import { useAuthStore } from "../stores/authStore";

export function useSessionSync() {
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      useAuthStore.getState().setAuth(session);
      useAuthStore.getState().setInitialized(true);
    });

    void supabase.auth.getSession().then(({ data: { session } }) => {
      useAuthStore.getState().setAuth(session);
      useAuthStore.getState().setInitialized(true);
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);
}