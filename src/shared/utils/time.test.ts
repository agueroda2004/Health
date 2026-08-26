import { describe, it, expect } from "vitest";
import { formatDuration, formatDurationShort, parseDurationInput } from "./time";

describe("formatDuration", () => {
  it("formatea mm:ss", () => {
    expect(formatDuration(1884)).toBe("31:24");
  });

  it("formatea h:mm:ss", () => {
    expect(formatDuration(5312)).toBe("1:28:32");
  });
});

describe("formatDurationShort", () => {
  it("formatea minutos", () => {
    expect(formatDurationShort(3120)).toBe("52 min");
  });

  it("formatea horas y minutos", () => {
    expect(formatDurationShort(5312)).toBe("1h 28m");
  });

  it("formatea segundos", () => {
    expect(formatDurationShort(45)).toBe("45 s");
  });
});

describe("parseDurationInput", () => {
  it("parsea mm:ss", () => {
    expect(parseDurationInput("31:24")).toBe(1884);
  });

  it("parsea h:mm:ss", () => {
    expect(parseDurationInput("1:28:32")).toBe(5312);
  });

  it("parsea segundos solos", () => {
    expect(parseDurationInput("90")).toBe(90);
  });

  it("rechaza valores inválidos", () => {
    expect(parseDurationInput("abc")).toBeNull();
    expect(parseDurationInput("-5")).toBeNull();
  });
});