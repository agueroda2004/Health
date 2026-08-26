import { describe, it, expect } from "vitest";
import { evaluatePR, computeBest } from "./prs";

describe("evaluatePR", () => {
  it("no considera PR si no hay peso o reps", () => {
    const res = evaluatePR({ weight: null, reps: 8, completed: true, isWarmup: false }, null);
    expect(res.isWeightPR).toBe(false);
  });

  it("es PR de peso cuando no hay mejor anterior", () => {
    const res = evaluatePR({ weight: 100, reps: 5, completed: true, isWarmup: false }, null);
    expect(res.isWeightPR).toBe(true);
    expect(res.isRepsPR).toBe(false);
  });

  it("es PR de peso si supera el mejor", () => {
    const res = evaluatePR(
      { weight: 110, reps: 5, completed: true, isWarmup: false },
      { weight: 100, reps: 5 },
    );
    expect(res.isWeightPR).toBe(true);
  });

  it("es PR de reps si mismo peso y más reps", () => {
    const res = evaluatePR(
      { weight: 100, reps: 6, completed: true, isWarmup: false },
      { weight: 100, reps: 5 },
    );
    expect(res.isWeightPR).toBe(false);
    expect(res.isRepsPR).toBe(true);
  });

  it("no es PR si es warmup o no completado", () => {
    const res = evaluatePR(
      { weight: 200, reps: 1, completed: true, isWarmup: true },
      { weight: 100, reps: 5 },
    );
    expect(res.isWeightPR).toBe(false);
  });
});

describe("computeBest", () => {
  it("devuelve el set con más peso (y más reps si empate)", () => {
    const sets = [
      { weight: 80, reps: 8, completed: true, isWarmup: false },
      { weight: 90, reps: 3, completed: true, isWarmup: false },
      { weight: 90, reps: 5, completed: true, isWarmup: false },
    ];
    expect(computeBest(sets)).toEqual({ weight: 90, reps: 5 });
  });

  it("ignora sets incompletos y warmups", () => {
    const sets = [
      { weight: 200, reps: 1, completed: false, isWarmup: false },
      { weight: 200, reps: 1, completed: true, isWarmup: true },
    ];
    expect(computeBest(sets)).toBeNull();
  });
});