import { describe, expect, it } from "vitest";
import { pairEntries } from "../pairing";

describe("pairEntries", () => {
  it("sin marcas, el próximo tipo es entrada", () => {
    const result = pairEntries([]);
    expect(result.nextType).toBe("in");
    expect(result.hasOpenEntry).toBe(false);
    expect(result.totalMinutes).toBe(0);
  });

  it("suma un tramo entrada/salida cerrado", () => {
    const result = pairEntries([
      { type: "in", occurredAt: "2026-07-05T09:00:00.000Z" },
      { type: "out", occurredAt: "2026-07-05T17:30:00.000Z" },
    ]);
    expect(result.totalMinutes).toBe(510);
    expect(result.hasOpenEntry).toBe(false);
    expect(result.nextType).toBe("in");
  });

  it("suma varios tramos del mismo día (mañana y tarde)", () => {
    const result = pairEntries([
      { type: "in", occurredAt: "2026-07-05T09:00:00.000Z" },
      { type: "out", occurredAt: "2026-07-05T13:00:00.000Z" },
      { type: "in", occurredAt: "2026-07-05T14:00:00.000Z" },
      { type: "out", occurredAt: "2026-07-05T18:00:00.000Z" },
    ]);
    expect(result.totalMinutes).toBe(480);
    expect(result.nextType).toBe("in");
  });

  it("detecta una entrada sin salida como abierta y no la contabiliza", () => {
    const result = pairEntries([
      { type: "in", occurredAt: "2026-07-05T09:00:00.000Z" },
      { type: "out", occurredAt: "2026-07-05T13:00:00.000Z" },
      { type: "in", occurredAt: "2026-07-05T14:00:00.000Z" },
    ]);
    expect(result.totalMinutes).toBe(240);
    expect(result.hasOpenEntry).toBe(true);
    expect(result.openSince).toBe("2026-07-05T14:00:00.000Z");
    expect(result.nextType).toBe("out");
  });

  it("funciona sin importar el orden de entrada de los registros", () => {
    const result = pairEntries([
      { type: "out", occurredAt: "2026-07-05T17:00:00.000Z" },
      { type: "in", occurredAt: "2026-07-05T09:00:00.000Z" },
    ]);
    expect(result.totalMinutes).toBe(480);
  });

  it("descarta los segundos: el total coincide con la resta de las horas mostradas (HH:mm)", () => {
    // Caso real reportado: entrada 07:51:05, salida 16:01:43 (hora Montevideo,
    // UTC-3). Sin truncar da 8.18h; la resta de las horas que ve el usuario
    // (16:01 − 07:51 = 8h10m) tiene que dar 8.17h → 490 minutos exactos.
    const result = pairEntries([
      { type: "in", occurredAt: "2026-07-21T10:51:05.291Z" },
      { type: "out", occurredAt: "2026-07-21T19:01:43.812Z" },
    ]);
    expect(result.totalMinutes).toBe(490);
  });
});
