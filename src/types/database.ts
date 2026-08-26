export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type RunType = "easy" | "tempo" | "intervals" | "long_run" | "recovery" | "race" | "other";
export type RideType = "road" | "mtb" | "indoor" | "recovery" | "long_ride" | "other";
export type MuscleGroup = "Pecho" | "Espalda" | "Hombros" | "Bíceps" | "Tríceps" | "Piernas" | "Glúteos" | "Core" | "Cuerpo completo";
export type GoalType = "distance" | "time" | "workouts";
export type GoalActivityType = "run" | "ride" | "gym" | "general";

type RowBase = {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
};

type InsertBase = {
  id?: string;
  user_id: string;
  created_at?: string;
  updated_at?: string;
};

type UpdateBase = {
  id?: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
};

type ChildRowBase = {
  id: string;
  created_at: string;
  updated_at: string;
};

type ChildInsertBase = {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

type ChildUpdateBase = {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export interface Database {
  public: {
    Tables: {
      fitness_gyms: {
        Row: RowBase & { gym_nombre: string; address: string | null; notes: string | null };
        Insert: InsertBase & { gym_nombre: string; address?: string | null; notes?: string | null };
        Update: UpdateBase & { gym_nombre?: string; address?: string | null; notes?: string | null };
        Relationships: [];
      };
      fitness_exercises: {
        Row: RowBase & {
          name: string;
          muscle_group: MuscleGroup | null;
          equipment: string | null;
          description: string | null;
          image_url: string | null;
        };
        Insert: InsertBase & {
          name: string;
          muscle_group?: MuscleGroup | null;
          equipment?: string | null;
          description?: string | null;
          image_url?: string | null;
        };
        Update: UpdateBase & {
          name?: string;
          muscle_group?: MuscleGroup | null;
          equipment?: string | null;
          description?: string | null;
          image_url?: string | null;
        };
        Relationships: [];
      };
      fitness_workout_templates: {
        Row: RowBase & { name: string; description: string | null; archived_at: string | null };
        Insert: InsertBase & { name: string; description?: string | null; archived_at?: string | null };
        Update: UpdateBase & { name?: string; description?: string | null; archived_at?: string | null };
        Relationships: [];
      };
      fitness_workout_template_days: {
        Row: ChildRowBase & { template_id: string; name: string; day_order: number; day_of_week: number | null; notes: string | null };
        Insert: ChildInsertBase & { template_id: string; name: string; day_order?: number; day_of_week?: number | null; notes?: string | null };
        Update: ChildUpdateBase & { template_id?: string; name?: string; day_order?: number; day_of_week?: number | null; notes?: string | null };
        Relationships: [];
      };
      fitness_workout_template_exercises: {
        Row: ChildRowBase & {
          template_day_id: string;
          exercise_id: string | null;
          exercise_order: number;
          target_sets: number | null;
          target_reps: string | null;
          target_weight: number | null;
          rest_seconds: number | null;
          notes: string | null;
        };
        Insert: ChildInsertBase & {
          template_day_id: string;
          exercise_id?: string | null;
          exercise_order?: number;
          target_sets?: number | null;
          target_reps?: string | null;
          target_weight?: number | null;
          rest_seconds?: number | null;
          notes?: string | null;
        };
        Update: ChildUpdateBase & {
          template_day_id?: string;
          exercise_id?: string | null;
          exercise_order?: number;
          target_sets?: number | null;
          target_reps?: string | null;
          target_weight?: number | null;
          rest_seconds?: number | null;
          notes?: string | null;
        };
        Relationships: [];
      };
      fitness_workouts: {
        Row: RowBase & {
          gym_id: string | null;
          template_id: string | null;
          template_day_id: string | null;
          started_at: string;
          completed_at: string | null;
          duration_seconds: number | null;
          notes: string | null;
        };
        Insert: InsertBase & {
          gym_id?: string | null;
          template_id?: string | null;
          template_day_id?: string | null;
          started_at?: string;
          completed_at?: string | null;
          duration_seconds?: number | null;
          notes?: string | null;
        };
        Update: UpdateBase & {
          gym_id?: string | null;
          template_id?: string | null;
          template_day_id?: string | null;
          started_at?: string;
          completed_at?: string | null;
          duration_seconds?: number | null;
          notes?: string | null;
        };
        Relationships: [];
      };
      fitness_workout_exercises: {
        Row: ChildRowBase & {
          workout_id: string;
          exercise_id: string | null;
          exercise_order: number;
          notes: string | null;
        };
        Insert: ChildInsertBase & {
          workout_id: string;
          exercise_id?: string | null;
          exercise_order?: number;
          notes?: string | null;
        };
        Update: ChildUpdateBase & {
          workout_id?: string;
          exercise_id?: string | null;
          exercise_order?: number;
          notes?: string | null;
        };
        Relationships: [];
      };
      fitness_workout_sets: {
        Row: ChildRowBase & {
          workout_exercise_id: string;
          set_number: number;
          weight: number | null;
          reps: number | null;
          duration_seconds: number | null;
          distance: number | null;
          is_warmup: boolean;
          completed: boolean;
        };
        Insert: ChildInsertBase & {
          workout_exercise_id: string;
          set_number?: number;
          weight?: number | null;
          reps?: number | null;
          duration_seconds?: number | null;
          distance?: number | null;
          is_warmup?: boolean;
          completed?: boolean;
        };
        Update: ChildUpdateBase & {
          workout_exercise_id?: string;
          set_number?: number;
          weight?: number | null;
          reps?: number | null;
          duration_seconds?: number | null;
          distance?: number | null;
          is_warmup?: boolean;
          completed?: boolean;
        };
        Relationships: [];
      };
      fitness_runs: {
        Row: RowBase & {
          started_at: string;
          ended_at: string | null;
          duration_seconds: number;
          distance_km: number;
          pace_seconds_per_km: number | null;
          elevation_gain: number | null;
          avg_heart_rate: number | null;
          calories: number | null;
          run_type: RunType;
          notes: string | null;
        };
        Insert: InsertBase & {
          started_at?: string;
          ended_at?: string | null;
          duration_seconds?: number;
          distance_km?: number;
          pace_seconds_per_km?: number | null;
          elevation_gain?: number | null;
          avg_heart_rate?: number | null;
          calories?: number | null;
          run_type?: RunType;
          notes?: string | null;
        };
        Update: UpdateBase & {
          started_at?: string;
          ended_at?: string | null;
          duration_seconds?: number;
          distance_km?: number;
          pace_seconds_per_km?: number | null;
          elevation_gain?: number | null;
          avg_heart_rate?: number | null;
          calories?: number | null;
          run_type?: RunType;
          notes?: string | null;
        };
        Relationships: [];
      };
      fitness_rides: {
        Row: RowBase & {
          started_at: string;
          ended_at: string | null;
          duration_seconds: number;
          distance_km: number;
          avg_speed_kmh: number | null;
          elevation_gain: number | null;
          avg_heart_rate: number | null;
          calories: number | null;
          ride_type: RideType;
          notes: string | null;
        };
        Insert: InsertBase & {
          started_at?: string;
          ended_at?: string | null;
          duration_seconds?: number;
          distance_km?: number;
          avg_speed_kmh?: number | null;
          elevation_gain?: number | null;
          avg_heart_rate?: number | null;
          calories?: number | null;
          ride_type?: RideType;
          notes?: string | null;
        };
        Update: UpdateBase & {
          started_at?: string;
          ended_at?: string | null;
          duration_seconds?: number;
          distance_km?: number;
          avg_speed_kmh?: number | null;
          elevation_gain?: number | null;
          avg_heart_rate?: number | null;
          calories?: number | null;
          ride_type?: RideType;
          notes?: string | null;
        };
        Relationships: [];
      };
      fitness_personal_records: {
        Row: RowBase & {
          exercise_id: string | null;
          weight: number | null;
          reps: number | null;
          achieved_at: string;
        };
        Insert: InsertBase & {
          exercise_id?: string | null;
          weight?: number | null;
          reps?: number | null;
          achieved_at?: string;
        };
        Update: UpdateBase & {
          exercise_id?: string | null;
          weight?: number | null;
          reps?: number | null;
          achieved_at?: string;
        };
        Relationships: [];
      };
      fitness_goals: {
        Row: RowBase & {
          type: GoalType;
          name: string;
          activity_type: GoalActivityType;
          target_value: number;
          current_value: number;
          unit: string | null;
          start_date: string;
          end_date: string | null;
        };
        Insert: InsertBase & {
          type?: GoalType;
          name: string;
          activity_type?: GoalActivityType;
          target_value: number;
          current_value?: number;
          unit?: string | null;
          start_date?: string;
          end_date?: string | null;
        };
        Update: UpdateBase & {
          type?: GoalType;
          name?: string;
          activity_type?: GoalActivityType;
          target_value?: number;
          current_value?: number;
          unit?: string | null;
          start_date?: string;
          end_date?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}