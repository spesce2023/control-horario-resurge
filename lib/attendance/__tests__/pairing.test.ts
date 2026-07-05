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
});
