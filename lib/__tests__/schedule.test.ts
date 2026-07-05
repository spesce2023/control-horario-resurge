import { describe, expect, it } from "vitest";
import { computeTotalHours, dayHours } from "@/lib/schedule";

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
