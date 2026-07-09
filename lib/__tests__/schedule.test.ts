import { describe, expect, it } from "vitest";
import { computeTotalHours, dayHours, scheduleMatchesTarget } from "@/lib/schedule";

describe("dayHours", () => {
  it("calcula la duración en horas al minuto exacto", () => {
    expect(dayHours({ weekday: 1, start: "09:00", end: "17:30" })).toBeCloseTo(8.5);
  });

  it("nunca es negativa si el horario está invertido", () => {
    expect(dayHours({ weekday: 1, start: "18:00", end: "09:00" })).toBe(0);
  });
});

describe("computeTotalHours", () => {
  it("suma todos los días", () => {
    const total = computeTotalHours([
      { weekday: 1, start: "09:00", end: "17:00" },
      { weekday: 2, start: "09:00", end: "13:00" },
    ]);
    expect(total).toBe(12);
  });

  it("es 0 sin días cargados", () => {
    expect(computeTotalHours([])).toBe(0);
  });
});

describe("scheduleMatchesTarget", () => {
  it("coincide cuando la suma es exacta", () => {
    const days = [
      { weekday: 1, start: "09:00", end: "17:00" },
      { weekday: 2, start: "09:00", end: "17:00" },
      { weekday: 3, start: "09:00", end: "17:00" },
      { weekday: 4, start: "09:00", end: "17:00" },
      { weekday: 5, start: "09:00", end: "17:00" },
    ];
    expect(scheduleMatchesTarget(days, 40)).toBe(true);
  });

  it("no coincide cuando la suma es distinta", () => {
    const days = [{ weekday: 1, start: "09:00", end: "17:00" }];
    expect(scheduleMatchesTarget(days, 40)).toBe(false);
  });

  it("tolera imprecisión de punto flotante al redondear a 2 decimales", () => {
    const days = [
      { weekday: 1, start: "09:00", end: "12:10" }, // 3h10m = 3.1666...h
      { weekday: 2, start: "09:00", end: "12:20" }, // 3h20m = 3.3333...h
    ];
    expect(scheduleMatchesTarget(days, 6.5)).toBe(true);
  });

  it("un horario vacío solo coincide con 0 horas pactadas", () => {
    expect(scheduleMatchesTarget([], 0)).toBe(true);
    expect(scheduleMatchesTarget([], 40)).toBe(false);
  });
});
