# Fitness Tracker

Aplicación personal de fitness (React + TypeScript + Vite + Tailwind CSS + Supabase).

- 🏋️ Gimnasio (gyms, ejercicios, rutinas, workouts, series, volumen, PRs)
- 🏃 Running
- 🚴 Cycling
- 📊 Dashboard, Historial, Estadísticas y Metas
- 📱 PWA instalable desde iPhone

## Requisitos

- Node.js 20+
- pnpm
- Proyecto Supabase existente (compartido)

## Configuración

1. Instalar dependencias:

```bash
pnpm install
```

2. Crear el archivo `.env` con las credenciales de tu proyecto Supabase:

```text
VITE_SUPABASE_URL=https://TU_PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-publica
```

## Base de datos (migración)

Este proyecto comparte el proyecto de Supabase con otras aplicaciones. **No se modifican ni eliminan tablas de otras aplicaciones.**

Todas las tablas usan el prefijo `fitness_`.

Antes de ejecutar la migración, inspecciona las tablas existentes:

```sql
select table_name from information_schema.tables
where table_schema = 'public' order by table_name;
```

Luego ejecuta el contenido de las migraciones en el **SQL Editor** de Supabase, en orden:

1. `supabase/migrations/0001_fitness_init.sql` — tablas, índices, triggers y RLS
2. `supabase/migrations/0002_fitness_day_of_week.sql` — asignación de día de la semana a los días de rutina
3. `supabase/migrations/0003_fitness_goals_types.sql` — elimina los tipos de meta volumen y velocidad

## Desarrollo

```bash
pnpm dev
```

## Verificación

```bash
pnpm lint
pnpm test
pnpm build
```