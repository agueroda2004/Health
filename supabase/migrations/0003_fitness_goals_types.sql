-- =============================================================
-- Fitness Tracker — V2: tipos de metas restringidos a
-- distancia, tiempo y entrenamientos (sin volumen/speed/other)
-- Proyecto compartido de Supabase (aislamiento con prefijo fitness_*).
-- Ejecutar en el SQL Editor de Supabase.
-- Idempotente: se puede ejecutar varias veces sin error.
-- =============================================================

-- Convierte cualquier meta existente de volumen/velocidad/otro a 'distance'
update public.fitness_goals
set type = 'distance'
where type in ('volume', 'speed', 'other');

-- Recrea el constraint con solo los tipos permitidos
alter table public.fitness_goals
  drop constraint if exists fitness_goals_type_check;

alter table public.fitness_goals
  add constraint fitness_goals_type_check
  check (type in ('distance', 'time', 'workouts'));