import { describe, it, expect } from "vitest";
import { goalProgress } from "./goals";

describe("goalProgress", () => {
  it("calcula progreso parcial", () => {
    const p = goalProgress(64.2, 100);
    expect(p.progressPct).toBeCloseTo(64.2, 1);
    expect(p.remaining).toBeCloseTo(35.8, 1);
    expect(p.isComplete).toBe(false);
  });

  it("marca completa al alcanzar la meta", () => {
    const p = goalProgress(100, 100);
    expect(p.isComplete).toBe(true);
    expect(p.progressPct).toBe(100);
    expect(p.remaining).toBe(0);
  });

  it("no excede el 100%", () => {
    const p = goalProgress(120, 100);
    expect(p.progressPct).toBe(100);
    expect(p.progress).toBe(100);
  });

  it("maneja target 0", () => {
    const p = goalProgress(50, 0);
    expect(p.progressPct).toBe(0);
    expect(p.isComplete).toBe(false);
  });
});