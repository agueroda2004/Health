import { describe, it, expect } from "vitest";
import { findScheduledWorkout, type ScheduledTemplate } from "./schedule";
import { weekdayIndex } from "./dates";

const ppl: ScheduledTemplate = {
  id: "t1",
  name: "PPL",
  template_days: [
    { id: "d1", name: "Push", day_of_week: 0 },
    { id: "d2", name: "Pull", day_of_week: 2 },
    { id: "d3", name: "Legs", day_of_week: 4 },
  ],
};

describe("weekdayIndex", () => {
  it("2026-08-26 es miércoles (índice 2)", () => {
    expect(weekdayIndex(new Date(2026, 7, 26))).toBe(2);
  });

  it("2026-09-01 es martes (índice 1)", () => {
    expect(weekdayIndex(new Date(2026, 8, 1))).toBe(1);
  });
});

describe("findScheduledWorkout", () => {
  it("devuelve el día asignado al día de la semana actual", () => {
    const res = findScheduledWorkout([ppl], new Date(2026, 7, 26)); // miércoles → Pull
    expect(res).not.toBeNull();
    expect(res!.day.name).toBe("Pull");
    expect(res!.dayIndex).toBe(1);
    expect(res!.template.id).toBe("t1");
  });

  it("devuelve null si hoy no tiene día asignado", () => {
    const res = findScheduledWorkout([ppl], new Date(2026, 7, 30)); // domingo
    expect(res).toBeNull();
  });

  it("ignora días sin day_of_week asignado", () => {
    const tpl: ScheduledTemplate = {
      id: "t2",
      name: "Sin asignar",
      template_days: [{ id: "x1", name: "Libre", day_of_week: null }],
    };
    expect(findScheduledWorkout([tpl], new Date(2026, 7, 26))).toBeNull();
  });

  it("toma la primera rutina que tenga el día asignado", () => {
    const t2: ScheduledTemplate = {
      id: "t3",
      name: "Upper/Lower",
      template_days: [
        { id: "u1", name: "Upper", day_of_week: 2 },
      ],
    };
    const res = findScheduledWorkout([ppl, t2], new Date(2026, 7, 26));
    expect(res!.template.id).toBe("t1");
  });
});