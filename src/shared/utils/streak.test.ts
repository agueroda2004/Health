import { describe, it, expect } from "vitest";
import { currentStreak, bestStreak } from "./streak";
import { toISODate } from "./dates";

function daysAgo(n: number): string {
  return toISODate(new Date(Date.now() - n * 86400000));
}

describe("currentStreak", () => {
  it("devuelve 0 sin actividades", () => {
    expect(currentStreak([])).toBe(0);
  });

  it("cuenta días consecutivos incluyendo hoy", () => {
    const dates = [daysAgo(0), daysAgo(1), daysAgo(2), daysAgo(4)];
    expect(currentStreak(dates)).toBe(3);
  });

  it("cuenta si el último día fue ayer", () => {
    const dates = [daysAgo(1), daysAgo(2), daysAgo(3)];
    expect(currentStreak(dates)).toBe(3);
  });

  it("devuelve 0 si el último día es más viejo que ayer", () => {
    const dates = [daysAgo(2), daysAgo(3)];
    expect(currentStreak(dates)).toBe(0);
  });

  it("ignora duplicados", () => {
    const dates = [daysAgo(0), daysAgo(0), daysAgo(1)];
    expect(currentStreak(dates)).toBe(2);
  });
});

describe("bestStreak", () => {
  it("devuelve 0 sin actividades", () => {
    expect(bestStreak([])).toBe(0);
  });

  it("encuentra la racha más larga", () => {
    const dates = [daysAgo(1), daysAgo(2), daysAgo(3), daysAgo(10), daysAgo(11), daysAgo(12), daysAgo(13)];
    expect(bestStreak(dates)).toBe(4);
  });

  it("maneja una única actividad", () => {
    expect(bestStreak([daysAgo(5)])).toBe(1);
  });
});