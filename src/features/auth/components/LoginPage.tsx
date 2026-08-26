import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dumbbell, Lock, Mail } from "lucide-react";
import { supabase } from "../../../lib/supabase/client";
import { Button } from "../../../shared/ui/Button";
import { Input } from "../../../shared/ui/Input";
import { Field } from "../../../shared/ui/Field";
import { notify } from "../../../shared/ui/notify";

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      notify.error("Credenciales incorrectas. Inténtalo de nuevo.");
      return;
    }
    navigate("/", { replace: true });
  }

  return (
    <div className="safe-top flex min-h-dvh flex-col items-center justify-center px-6 pb-12">
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="flex h-20 w-20 animate-pop items-center justify-center rounded-3xl bg-primary text-white shadow-[0_6px_0_0_#c2410c]">
          <Dumbbell className="h-10 w-10" />
        </div>
        <h1 className="text-3xl font-extrabold text-zinc-800 dark:text-zinc-100">Fitness</h1>
        <p className="text-sm font-medium text-zinc-400">Tu entrenamiento, tu progreso.</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <Field label="Email">
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="pl-12"
              autoCapitalize="none"
            />
          </div>
        </Field>

        <Field label="Contraseña">
          <div className="relative">
            <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
            <Input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="pl-12"
            />
          </div>
        </Field>

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? "Entrando…" : "Iniciar sesión"}
        </Button>
      </form>
    </div>
  );
}