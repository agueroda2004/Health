import { weekdayIndex } from "./dates";

export type ScheduledTemplate = {
  id: string;
  name: string;
  template_days: { id: string; name: string; day_of_week: number | null }[];
};

export type ScheduledWorkout = {
  template: ScheduledTemplate;
  day: { id: string; name: string; day_of_week: number | null };
  dayIndex: number;
};

export function findScheduledWorkout(
  templates: ScheduledTemplate[],
  date: Date,
): ScheduledWorkout | null {
  const today = weekdayIndex(date);
  for (const template of templates) {
    for (let i = 0; i < template.template_days.length; i++) {
      const day = template.template_days[i];
      if (day.day_of_week === today) {
        return { template, day, dayIndex: i };
      }
    }
  }
  return null;
}