-- =============================================================
-- Fitness Tracker V1 — Inicialización
-- Proyecto compartido de Supabase (aislamiento con prefijo fitness_*).
-- NO modifica ni elimina tablas de otras aplicaciones.
-- Ejecutar en el SQL Editor de Supabase (proyecto existente).
--
-- ANTES DE EJECUTAR, inspecciona las tablas existentes:
--   select table_name from information_schema.tables
--   where table_schema = 'public' order by table_name;
-- =============================================================

-- ------------------------------------------------------------------
-- Función set_updated_at (idempotente; compartida con otras apps)
-- ------------------------------------------------------------------
create or replace function public.set_updated_at ()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =============================================================
-- 1. fitness_gyms
-- =============================================================
create table public.fitness_gyms (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  gym_nombre text not null,
  address text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================================
-- 2. fitness_exercises
-- =============================================================
create table public.fitness_exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  muscle_group text,
  equipment text,
  description text,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================================
-- 3. fitness_workout_templates (rutinas)
-- =============================================================
create table public.fitness_workout_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  description text,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================================
-- 4. fitness_workout_template_days (días de una rutina)
-- =============================================================
create table public.fitness_workout_template_days (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.fitness_workout_templates (id) on delete cascade,
  name text not null,
  day_order integer not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================================
-- 5. fitness_workout_template_exercises (ejercicios de un día)
-- =============================================================
create table public.fitness_workout_template_exercises (
  id uuid primary key default gen_random_uuid(),
  template_day_id uuid not null references public.fitness_workout_template_days (id) on delete cascade,
  exercise_id uuid references public.fitness_exercises (id) on delete set null,
  exercise_order integer not null default 0,
  target_sets integer,
  target_reps text,
  target_weight numeric,
  rest_seconds integer,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================================
-- 6. fitness_workouts (sesiones reales)
-- =============================================================
create table public.fitness_workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  gym_id uuid references public.fitness_gyms (id) on delete set null,
  template_id uuid references public.fitness_workout_templates (id) on delete set null,
  template_day_id uuid references public.fitness_workout_template_days (id) on delete set null,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  duration_seconds integer,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================================
-- 7. fitness_workout_exercises (ejercicios de una sesión)
-- =============================================================
create table public.fitness_workout_exercises (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references public.fitness_workouts (id) on delete cascade,
  exercise_id uuid references public.fitness_exercises (id) on delete set null,
  exercise_order integer not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================================
-- 8. fitness_workout_sets (series)
-- =============================================================
create table public.fitness_workout_sets (
  id uuid primary key default gen_random_uuid(),
  workout_exercise_id uuid not null references public.fitness_workout_exercises (id) on delete cascade,
  set_number integer not null default 1,
  weight numeric,
  reps integer,
  duration_seconds integer,
  distance numeric,
  is_warmup boolean not null default false,
  completed boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================================
-- 9. fitness_runs
-- =============================================================
create table public.fitness_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  duration_seconds integer not null default 0,
  distance_km numeric not null default 0,
  pace_seconds_per_km numeric,
  elevation_gain numeric,
  avg_heart_rate integer,
  calories integer,
  run_type text not null default 'easy' check (run_type in ('easy','tempo','intervals','long_run','recovery','race','other')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================================
-- 10. fitness_rides
-- =============================================================
create table public.fitness_rides (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  duration_seconds integer not null default 0,
  distance_km numeric not null default 0,
  avg_speed_kmh numeric,
  elevation_gain numeric,
  avg_heart_rate integer,
  calories integer,
  ride_type text not null default 'road' check (ride_type in ('road','mtb','indoor','recovery','long_ride','other')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================================
-- 11. fitness_personal_records (PRs)
-- =============================================================
create table public.fitness_personal_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  exercise_id uuid references public.fitness_exercises (id) on delete cascade,
  weight numeric,
  reps integer,
  achieved_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================================
-- 12. fitness_goals
-- =============================================================
create table public.fitness_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null default 'distance' check (type in ('distance','time','workouts','volume','speed','other')),
  name text not null,
  activity_type text not null default 'run' check (activity_type in ('run','ride','gym','general')),
  target_value numeric not null,
  current_value numeric not null default 0,
  unit text,
  start_date date not null default current_date,
  end_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date is null or end_date >= start_date)
);

-- =============================================================
-- Índices
-- =============================================================
create index idx_fitness_gyms_user on public.fitness_gyms (user_id);
create index idx_fitness_exercises_user on public.fitness_exercises (user_id);
create index idx_fitness_templates_user on public.fitness_workout_templates (user_id);
create index idx_fitness_template_days_template on public.fitness_workout_template_days (template_id);
create index idx_fitness_template_ex_day on public.fitness_workout_template_exercises (template_day_id);
create index idx_fitness_template_ex_exercise on public.fitness_workout_template_exercises (exercise_id);
create index idx_fitness_workouts_user_started on public.fitness_workouts (user_id, started_at);
create index idx_fitness_workouts_gym on public.fitness_workouts (gym_id);
create index idx_fitness_workout_ex_workout on public.fitness_workout_exercises (workout_id);
create index idx_fitness_workout_ex_exercise on public.fitness_workout_exercises (exercise_id);
create index idx_fitness_sets_workout_ex on public.fitness_workout_sets (workout_exercise_id);
create index idx_fitness_runs_user_started on public.fitness_runs (user_id, started_at);
create index idx_fitness_rides_user_started on public.fitness_rides (user_id, started_at);
create index idx_fitness_pr_user on public.fitness_personal_records (user_id);
create index idx_fitness_pr_exercise on public.fitness_personal_records (exercise_id);
create index idx_fitness_goals_user on public.fitness_goals (user_id);

-- =============================================================
-- Triggers updated_at
-- =============================================================
drop trigger if exists fitness_gyms_set_updated_at on public.fitness_gyms;
create trigger fitness_gyms_set_updated_at
  before update on public.fitness_gyms
  for each row execute function public.set_updated_at ();

drop trigger if exists fitness_exercises_set_updated_at on public.fitness_exercises;
create trigger fitness_exercises_set_updated_at
  before update on public.fitness_exercises
  for each row execute function public.set_updated_at ();

drop trigger if exists fitness_templates_set_updated_at on public.fitness_workout_templates;
create trigger fitness_templates_set_updated_at
  before update on public.fitness_workout_templates
  for each row execute function public.set_updated_at ();

drop trigger if exists fitness_template_days_set_updated_at on public.fitness_workout_template_days;
create trigger fitness_template_days_set_updated_at
  before update on public.fitness_workout_template_days
  for each row execute function public.set_updated_at ();

drop trigger if exists fitness_template_ex_set_updated_at on public.fitness_workout_template_exercises;
create trigger fitness_template_ex_set_updated_at
  before update on public.fitness_workout_template_exercises
  for each row execute function public.set_updated_at ();

drop trigger if exists fitness_workouts_set_updated_at on public.fitness_workouts;
create trigger fitness_workouts_set_updated_at
  before update on public.fitness_workouts
  for each row execute function public.set_updated_at ();

drop trigger if exists fitness_workout_ex_set_updated_at on public.fitness_workout_exercises;
create trigger fitness_workout_ex_set_updated_at
  before update on public.fitness_workout_exercises
  for each row execute function public.set_updated_at ();

drop trigger if exists fitness_sets_set_updated_at on public.fitness_workout_sets;
create trigger fitness_sets_set_updated_at
  before update on public.fitness_workout_sets
  for each row execute function public.set_updated_at ();

drop trigger if exists fitness_runs_set_updated_at on public.fitness_runs;
create trigger fitness_runs_set_updated_at
  before update on public.fitness_runs
  for each row execute function public.set_updated_at ();

drop trigger if exists fitness_rides_set_updated_at on public.fitness_rides;
create trigger fitness_rides_set_updated_at
  before update on public.fitness_rides
  for each row execute function public.set_updated_at ();

drop trigger if exists fitness_pr_set_updated_at on public.fitness_personal_records;
create trigger fitness_pr_set_updated_at
  before update on public.fitness_personal_records
  for each row execute function public.set_updated_at ();

drop trigger if exists fitness_goals_set_updated_at on public.fitness_goals;
create trigger fitness_goals_set_updated_at
  before update on public.fitness_goals
  for each row execute function public.set_updated_at ();

-- =============================================================
-- Row Level Security
-- =============================================================
alter table public.fitness_gyms enable row level security;
alter table public.fitness_exercises enable row level security;
alter table public.fitness_workout_templates enable row level security;
alter table public.fitness_workout_template_days enable row level security;
alter table public.fitness_workout_template_exercises enable row level security;
alter table public.fitness_workouts enable row level security;
alter table public.fitness_workout_exercises enable row level security;
alter table public.fitness_workout_sets enable row level security;
alter table public.fitness_runs enable row level security;
alter table public.fitness_rides enable row level security;
alter table public.fitness_personal_records enable row level security;
alter table public.fitness_goals enable row level security;

-- fitness_gyms
drop policy if exists "fitness_gyms select own" on public.fitness_gyms;
create policy "fitness_gyms select own" on public.fitness_gyms for select using (auth.uid() = user_id);
drop policy if exists "fitness_gyms insert own" on public.fitness_gyms;
create policy "fitness_gyms insert own" on public.fitness_gyms for insert with check (auth.uid() = user_id);
drop policy if exists "fitness_gyms update own" on public.fitness_gyms;
create policy "fitness_gyms update own" on public.fitness_gyms for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "fitness_gyms delete own" on public.fitness_gyms;
create policy "fitness_gyms delete own" on public.fitness_gyms for delete using (auth.uid() = user_id);

-- fitness_exercises
drop policy if exists "fitness_exercises select own" on public.fitness_exercises;
create policy "fitness_exercises select own" on public.fitness_exercises for select using (auth.uid() = user_id);
drop policy if exists "fitness_exercises insert own" on public.fitness_exercises;
create policy "fitness_exercises insert own" on public.fitness_exercises for insert with check (auth.uid() = user_id);
drop policy if exists "fitness_exercises update own" on public.fitness_exercises;
create policy "fitness_exercises update own" on public.fitness_exercises for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "fitness_exercises delete own" on public.fitness_exercises;
create policy "fitness_exercises delete own" on public.fitness_exercises for delete using (auth.uid() = user_id);

-- fitness_workout_templates
drop policy if exists "fitness_templates select own" on public.fitness_workout_templates;
create policy "fitness_templates select own" on public.fitness_workout_templates for select using (auth.uid() = user_id);
drop policy if exists "fitness_templates insert own" on public.fitness_workout_templates;
create policy "fitness_templates insert own" on public.fitness_workout_templates for insert with check (auth.uid() = user_id);
drop policy if exists "fitness_templates update own" on public.fitness_workout_templates;
create policy "fitness_templates update own" on public.fitness_workout_templates for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "fitness_templates delete own" on public.fitness_workout_templates;
create policy "fitness_templates delete own" on public.fitness_workout_templates for delete using (auth.uid() = user_id);

-- fitness_workout_template_days (vía template)
drop policy if exists "fitness_template_days select own" on public.fitness_workout_template_days;
create policy "fitness_template_days select own" on public.fitness_workout_template_days for select using (exists (
  select 1 from public.fitness_workout_templates t where t.id = template_id and t.user_id = auth.uid()));
drop policy if exists "fitness_template_days insert own" on public.fitness_workout_template_days;
create policy "fitness_template_days insert own" on public.fitness_workout_template_days for insert with check (exists (
  select 1 from public.fitness_workout_templates t where t.id = template_id and t.user_id = auth.uid()));
drop policy if exists "fitness_template_days update own" on public.fitness_workout_template_days;
create policy "fitness_template_days update own" on public.fitness_workout_template_days for update using (exists (
  select 1 from public.fitness_workout_templates t where t.id = template_id and t.user_id = auth.uid())) with check (exists (
  select 1 from public.fitness_workout_templates t where t.id = template_id and t.user_id = auth.uid()));
drop policy if exists "fitness_template_days delete own" on public.fitness_workout_template_days;
create policy "fitness_template_days delete own" on public.fitness_workout_template_days for delete using (exists (
  select 1 from public.fitness_workout_templates t where t.id = template_id and t.user_id = auth.uid()));

-- fitness_workout_template_exercises (vía day -> template)
drop policy if exists "fitness_template_ex select own" on public.fitness_workout_template_exercises;
create policy "fitness_template_ex select own" on public.fitness_workout_template_exercises for select using (exists (
  select 1 from public.fitness_workout_template_days d
  join public.fitness_workout_templates t on t.id = d.template_id
  where d.id = template_day_id and t.user_id = auth.uid()));
drop policy if exists "fitness_template_ex insert own" on public.fitness_workout_template_exercises;
create policy "fitness_template_ex insert own" on public.fitness_workout_template_exercises for insert with check (exists (
  select 1 from public.fitness_workout_template_days d
  join public.fitness_workout_templates t on t.id = d.template_id
  where d.id = template_day_id and t.user_id = auth.uid()));
drop policy if exists "fitness_template_ex update own" on public.fitness_workout_template_exercises;
create policy "fitness_template_ex update own" on public.fitness_workout_template_exercises for update using (exists (
  select 1 from public.fitness_workout_template_days d
  join public.fitness_workout_templates t on t.id = d.template_id
  where d.id = template_day_id and t.user_id = auth.uid())) with check (exists (
  select 1 from public.fitness_workout_template_days d
  join public.fitness_workout_templates t on t.id = d.template_id
  where d.id = template_day_id and t.user_id = auth.uid()));
drop policy if exists "fitness_template_ex delete own" on public.fitness_workout_template_exercises;
create policy "fitness_template_ex delete own" on public.fitness_workout_template_exercises for delete using (exists (
  select 1 from public.fitness_workout_template_days d
  join public.fitness_workout_templates t on t.id = d.template_id
  where d.id = template_day_id and t.user_id = auth.uid()));

-- fitness_workouts
drop policy if exists "fitness_workouts select own" on public.fitness_workouts;
create policy "fitness_workouts select own" on public.fitness_workouts for select using (auth.uid() = user_id);
drop policy if exists "fitness_workouts insert own" on public.fitness_workouts;
create policy "fitness_workouts insert own" on public.fitness_workouts for insert with check (auth.uid() = user_id);
drop policy if exists "fitness_workouts update own" on public.fitness_workouts;
create policy "fitness_workouts update own" on public.fitness_workouts for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "fitness_workouts delete own" on public.fitness_workouts;
create policy "fitness_workouts delete own" on public.fitness_workouts for delete using (auth.uid() = user_id);

-- fitness_workout_exercises (vía workout)
drop policy if exists "fitness_workout_ex select own" on public.fitness_workout_exercises;
create policy "fitness_workout_ex select own" on public.fitness_workout_exercises for select using (exists (
  select 1 from public.fitness_workouts w where w.id = workout_id and w.user_id = auth.uid()));
drop policy if exists "fitness_workout_ex insert own" on public.fitness_workout_exercises;
create policy "fitness_workout_ex insert own" on public.fitness_workout_exercises for insert with check (exists (
  select 1 from public.fitness_workouts w where w.id = workout_id and w.user_id = auth.uid()));
drop policy if exists "fitness_workout_ex update own" on public.fitness_workout_exercises;
create policy "fitness_workout_ex update own" on public.fitness_workout_exercises for update using (exists (
  select 1 from public.fitness_workouts w where w.id = workout_id and w.user_id = auth.uid())) with check (exists (
  select 1 from public.fitness_workouts w where w.id = workout_id and w.user_id = auth.uid()));
drop policy if exists "fitness_workout_ex delete own" on public.fitness_workout_exercises;
create policy "fitness_workout_ex delete own" on public.fitness_workout_exercises for delete using (exists (
  select 1 from public.fitness_workouts w where w.id = workout_id and w.user_id = auth.uid()));

-- fitness_workout_sets (vía workout_exercise -> workout)
drop policy if exists "fitness_sets select own" on public.fitness_workout_sets;
create policy "fitness_sets select own" on public.fitness_workout_sets for select using (exists (
  select 1 from public.fitness_workout_exercises we
  join public.fitness_workouts w on w.id = we.workout_id
  where we.id = workout_exercise_id and w.user_id = auth.uid()));
drop policy if exists "fitness_sets insert own" on public.fitness_workout_sets;
create policy "fitness_sets insert own" on public.fitness_workout_sets for insert with check (exists (
  select 1 from public.fitness_workout_exercises we
  join public.fitness_workouts w on w.id = we.workout_id
  where we.id = workout_exercise_id and w.user_id = auth.uid()));
drop policy if exists "fitness_sets update own" on public.fitness_workout_sets;
create policy "fitness_sets update own" on public.fitness_workout_sets for update using (exists (
  select 1 from public.fitness_workout_exercises we
  join public.fitness_workouts w on w.id = we.workout_id
  where we.id = workout_exercise_id and w.user_id = auth.uid())) with check (exists (
  select 1 from public.fitness_workout_exercises we
  join public.fitness_workouts w on w.id = we.workout_id
  where we.id = workout_exercise_id and w.user_id = auth.uid()));
drop policy if exists "fitness_sets delete own" on public.fitness_workout_sets;
create policy "fitness_sets delete own" on public.fitness_workout_sets for delete using (exists (
  select 1 from public.fitness_workout_exercises we
  join public.fitness_workouts w on w.id = we.workout_id
  where we.id = workout_exercise_id and w.user_id = auth.uid()));

-- fitness_runs
drop policy if exists "fitness_runs select own" on public.fitness_runs;
create policy "fitness_runs select own" on public.fitness_runs for select using (auth.uid() = user_id);
drop policy if exists "fitness_runs insert own" on public.fitness_runs;
create policy "fitness_runs insert own" on public.fitness_runs for insert with check (auth.uid() = user_id);
drop policy if exists "fitness_runs update own" on public.fitness_runs;
create policy "fitness_runs update own" on public.fitness_runs for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "fitness_runs delete own" on public.fitness_runs;
create policy "fitness_runs delete own" on public.fitness_runs for delete using (auth.uid() = user_id);

-- fitness_rides
drop policy if exists "fitness_rides select own" on public.fitness_rides;
create policy "fitness_rides select own" on public.fitness_rides for select using (auth.uid() = user_id);
drop policy if exists "fitness_rides insert own" on public.fitness_rides;
create policy "fitness_rides insert own" on public.fitness_rides for insert with check (auth.uid() = user_id);
drop policy if exists "fitness_rides update own" on public.fitness_rides;
create policy "fitness_rides update own" on public.fitness_rides for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "fitness_rides delete own" on public.fitness_rides;
create policy "fitness_rides delete own" on public.fitness_rides for delete using (auth.uid() = user_id);

-- fitness_personal_records
drop policy if exists "fitness_pr select own" on public.fitness_personal_records;
create policy "fitness_pr select own" on public.fitness_personal_records for select using (auth.uid() = user_id);
drop policy if exists "fitness_pr insert own" on public.fitness_personal_records;
create policy "fitness_pr insert own" on public.fitness_personal_records for insert with check (auth.uid() = user_id);
drop policy if exists "fitness_pr update own" on public.fitness_personal_records;
create policy "fitness_pr update own" on public.fitness_personal_records for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "fitness_pr delete own" on public.fitness_personal_records;
create policy "fitness_pr delete own" on public.fitness_personal_records for delete using (auth.uid() = user_id);

-- fitness_goals
drop policy if exists "fitness_goals select own" on public.fitness_goals;
create policy "fitness_goals select own" on public.fitness_goals for select using (auth.uid() = user_id);
drop policy if exists "fitness_goals insert own" on public.fitness_goals;
create policy "fitness_goals insert own" on public.fitness_goals for insert with check (auth.uid() = user_id);
drop policy if exists "fitness_goals update own" on public.fitness_goals;
create policy "fitness_goals update own" on public.fitness_goals for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "fitness_goals delete own" on public.fitness_goals;
create policy "fitness_goals delete own" on public.fitness_goals for delete using (auth.uid() = user_id);
