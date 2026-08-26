import { describe, it, expect } from "vitest";
import { toKg, fromKg, toKm, fromKm } from "./units";

describe("peso", () => {
  it("kg es identidad", () => {
    expect(toKg(80, "kg")).toBe(80);
    expect(fromKg(80, "kg")).toBe(80);
  });

  it("convierte lb a kg y viceversa", () => {
    expect(toKg(220.462, "lb")).toBeCloseTo(100, 0);
    expect(fromKg(100, "lb")).toBeCloseTo(220.462, 1);
  });
});

describe("distancia", () => {
  it("km es identidad", () => {
    expect(toKm(5, "km")).toBe(5);
    expect(fromKm(5, "km")).toBe(5);
  });

  it("convierte millas a km y viceversa", () => {
    expect(toKm(1, "miles")).toBeCloseTo(1.609, 2);
    expect(fromKm(1.609, "miles")).toBeCloseTo(1, 1);
  });
});