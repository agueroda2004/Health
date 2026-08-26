import { describe, it, expect } from "vitest";
import { computePace, formatPace, computeAvgSpeedKmh, formatSpeedKmh } from "./pace";

describe("computePace", () => {
  it("calcula ritmo por km", () => {
    expect(computePace(1800, 5)).toBeCloseTo(360, 5);
  });

  it("devuelve null si distancia es 0", () => {
    expect(computePace(1800, 0)).toBeNull();
  });
});

describe("formatPace", () => {
  it("formatea mm:ss /km", () => {
    expect(formatPace(348)).toBe("5:48 /km");
  });

  it("devuelve guión si es null", () => {
    expect(formatPace(null)).toBe("–");
  });
});

describe("computeAvgSpeedKmh", () => {
  it("calcula velocidad media", () => {
    expect(computeAvgSpeedKmh(5320, 32.4)).toBeCloseTo(21.92, 1);
  });

  it("devuelve null si tiempo es 0", () => {
    expect(computeAvgSpeedKmh(0, 10)).toBeNull();
  });
});

describe("formatSpeedKmh", () => {
  it("formatea con un decimal", () => {
    expect(formatSpeedKmh(21.92)).toBe("21.9 km/h");
  });
});