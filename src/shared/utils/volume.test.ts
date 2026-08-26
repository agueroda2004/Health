import { describe, it, expect } from "vitest";
import { setVolume, workoutVolume, totalSets } from "./volume";

describe("setVolume", () => {
  it("calcula peso x reps", () => {
    expect(setVolume({ weight: 80, reps: 8, completed: true, isWarmup: false })).toBe(640);
  });

  it("devuelve 0 para sets sin completar", () => {
    expect(setVolume({ weight: 80, reps: 8, completed: false, isWarmup: false })).toBe(0);
  });

  it("devuelve 0 para warmups", () => {
    expect(setVolume({ weight: 40, reps: 10, completed: true, isWarmup: true })).toBe(0);
  });

  it("devuelve 0 si no hay peso o reps", () => {
    expect(setVolume({ weight: null, reps: 8, completed: true, isWarmup: false })).toBe(0);
    expect(setVolume({ weight: 80, reps: null, completed: true, isWarmup: false })).toBe(0);
  });
});

describe("workoutVolume", () => {
  it("suma el volumen de todos los sets", () => {
    const sets = [
      { weight: 80, reps: 8, completed: true, isWarmup: false },
      { weight: 80, reps: 8, completed: true, isWarmup: false },
      { weight: 85, reps: 6, completed: true, isWarmup: false },
    ];
    expect(workoutVolume(sets)).toBe(640 + 640 + 510);
  });
});

describe("totalSets", () => {
  it("cuenta solo sets completados no warmup", () => {
    const sets = [
      { weight: 80, reps: 8, completed: true, isWarmup: false },
      { weight: 40, reps: 10, completed: true, isWarmup: true },
      { weight: 80, reps: 8, completed: false, isWarmup: false },
    ];
    expect(totalSets(sets)).toBe(1);
  });
});