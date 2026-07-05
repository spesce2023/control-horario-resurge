import { describe, expect, it } from "vitest";
import { uniqueSheetName, weeksStartingInMonth } from "../monthly-math";

describe("weeksStartingInMonth", () => {
  it("solo incluye semanas cuyo lunes cae dentro del mes", () => {
    const weeks = weeksStartingInMonth("2026-07");
    for (const week of weeks) {
      expect(week.startsWith("2026-07")).toBe(true);
    }
  });

  it("cada semana está separada por 7 días", () => {
    const weeks = weeksStartingInMonth("2026-07");
    for (let i = 1; i < weeks.length; i++) {
      const diffDays =
        (new Date(weeks[i]).getTime() - new Date(weeks[i - 1]).getTime()) / 86_400_000;
      expect(diffDays).toBe(7);
    }
  });

  it("un mes de 28 días (sin semanas parciales) tiene exactamente 4", () => {
    // Febrero 2027 no es bisiesto y empieza lunes -> 4 semanas exactas dentro del mes
    const weeks = weeksStartingInMonth("2027-02");
    expect(weeks).toHaveLength(4);
  });
});

describe("uniqueSheetName", () => {
  it("saca caracteres inválidos de Excel", () => {
    const used = new Set<string>();
    expect(uniqueSheetName("Juan/Perez:Test", "id-1", used)).toBe("JuanPerezTest");
  });

  it("trunca a 31 caracteres", () => {
    const used = new Set<string>();
    const long = "Nombre Extremadamente Largo Que Supera El Limite";
    expect(uniqueSheetName(long, "id-1", used).length).toBeLessThanOrEqual(31);
  });

  it("desambigua nombres repetidos", () => {
    const used = new Set<string>();
    const first = uniqueSheetName("Juan Perez", "id-1", used);
    const second = uniqueSheetName("Juan Perez", "id-2", used);
    expect(first).not.toBe(second);
  });

  it("usa el fallback si el nombre queda vacío", () => {
    const used = new Set<string>();
    expect(uniqueSheetName(":://", "id-1", used)).toBe("id-1");
  });
});
