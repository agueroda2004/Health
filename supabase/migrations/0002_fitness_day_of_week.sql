-- =============================================================
-- Fitness Tracker — V2: day_of_week en días de rutina
-- Proyecto compartido de Supabase (aislamiento con prefijo fitness_*).
-- Ejecutar en el SQL Editor de Supabase.
-- Idempotente: se puede ejecutar varias veces sin error.
-- =============================================================

alter table public.fitness_workout_template_days
  add column if not exists day_of_week smallint;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'fitness_template_days_day_of_week_check'
  ) then
    alter table public.fitness_workout_template_days
      add constraint fitness_template_days_day_of_week_check
      check (day_of_week is null or day_of_week between 0 and 6);
  end if;
end $$;

create index if not exists idx_fitness_template_days_weekday
  on public.fitness_workout_template_days (template_id, day_of_week);