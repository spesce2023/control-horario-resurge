import { addDays, parseISO } from "date-fns";
import { describe, expect, it } from "vitest";
import {
  computeLiquidacion,
  firstInTime,
  lastOutTime,
  uniqueSheetName,
  weeksOverlappingMonth,
} from "../monthly-math";

describe("weeksOverlappingMonth", () => {
  it("cada semana está separada por 7 días", () => {
    const weeks = weeksOverlappingMonth("2026-07");
    for (let i = 1; i < weeks.length; i++) {
      const diffDays =
        (parseISO(weeks[i]).getTime() - parseISO(weeks[i - 1]).getTime()) / 86_400_000;
      expect(diffDays).toBe(7);
    }
  });

  it("un mes que empieza en lunes tiene exactamente 4 semanas, todas dentro del mes", () => {
    // Febrero 2027 no es bisiesto y empieza lunes -> semanas completas dentro del mes
    const weeks = weeksOverlappingMonth("2027-02");
    expect(weeks).toHaveLength(4);
    for (const week of weeks) {
      expect(week.startsWith("2027-02")).toBe(true);
    }
  });

  it("incluye la semana límite aunque su lunes sea del mes anterior", () => {
    // Si el 1° del mes no cae en lunes, la semana que lo contiene empieza antes
    const first = parseISO("2026-07-01");
    const weeks = weeksOverlappingMonth("2026-07");
    const firstWeekStart = parseISO(weeks[0]);
    const firstWeekEnd = addDays(firstWeekStart, 6);

    expect(firstWeekStart.getTime()).toBeLessThanOrEqual(first.getTime());
    expect(firstWeekEnd.getTime()).toBeGreaterThanOrEqual(first.getTime());
  });

  it("la última semana incluida contiene el último día del mes", () => {
    const weeks = weeksOverlappingMonth("2026-07");
    const lastWeekStart = parseISO(weeks[weeks.length - 1]);
    const lastWeekEnd = addDays(lastWeekStart, 6);
    const lastOfMonth = parseISO("2026-07-31");

    expect(lastWeekStart.getTime()).toBeLessThanOrEqual(lastOfMonth.getTime());
    expect(lastWeekEnd.getTime()).toBeGreaterThanOrEqual(lastOfMonth.getTime());
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

describe("computeLiquidacion", () => {
  it("paga a valor simple cuando las horas trabajadas no superan las pactadas", () => {
    const result = computeLiquidacion({ pactadas: 160, trabajadas: 150, hourlyRate: 100 });
    expect(result.horasNormales).toBe(150);
    expect(result.horasExtra).toBe(0);
    expect(result.pagoNormal).toBe(15000);
    expect(result.pagoExtra).toBe(0);
    expect(result.total).toBe(15000);
  });

  it("paga exactamente las pactadas a valor simple cuando coinciden", () => {
    const result = computeLiquidacion({ pactadas: 160, trabajadas: 160, hourlyRate: 100 });
    expect(result.horasNormales).toBe(160);
    expect(result.horasExtra).toBe(0);
    expect(result.total).toBe(16000);
  });

  it("paga el excedente al doble cuando las horas trabajadas superan las pactadas", () => {
    const result = computeLiquidacion({ pactadas: 160, trabajadas: 170, hourlyRate: 100 });
    expect(result.horasNormales).toBe(160);
    expect(result.horasExtra).toBe(10);
    expect(result.pagoNormal).toBe(16000);
    expect(result.pagoExtra).toBe(2000);
    expect(result.total).toBe(18000);
  });
});

describe("firstInTime / lastOutTime", () => {
  const entries = [
    { type: "in" as const, occurredAt: "2026-07-01T09:00:00Z" },
    { type: "out" as const, occurredAt: "2026-07-01T13:00:00Z" },
    { type: "in" as const, occurredAt: "2026-07-01T14:00:00Z" },
    { type: "out" as const, occurredAt: "2026-07-01T18:00:00Z" },
  ];

  it("toma la primera entrada del día", () => {
    expect(firstInTime(entries)).toBe("2026-07-01T09:00:00Z");
  });

  it("toma la última salida del día", () => {
    expect(lastOutTime(entries)).toBe("2026-07-01T18:00:00Z");
  });

  it("devuelve null si no hay entrada u salida", () => {
    expect(firstInTime([])).toBeNull();
    expect(lastOutTime([])).toBeNull();
  });
});
