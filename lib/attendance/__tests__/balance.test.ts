import { describe, expect, it } from "vitest";
import { computeBalance } from "../balance-math";

describe("computeBalance", () => {
  it("saldo positivo cuando se trabajó menos de lo pactado", () => {
    const result = computeBalance({ pactadas: 40, trabajadasMinutes: 35 * 60, ajustes: 0 });
    expect(result.trabajadas).toBe(35);
    expect(result.saldo).toBe(5);
  });

  it("saldo negativo cuando se trabajó de más", () => {
    const result = computeBalance({ pactadas: 40, trabajadasMinutes: 44 * 60, ajustes: 0 });
    expect(result.saldo).toBe(-4);
  });

  it("los ajustes manuales suman o restan del saldo", () => {
    const result = computeBalance({ pactadas: 40, trabajadasMinutes: 38 * 60, ajustes: 3 });
    expect(result.saldo).toBe(5);

    const negative = computeBalance({ pactadas: 40, trabajadasMinutes: 38 * 60, ajustes: -1 });
    expect(negative.saldo).toBe(1);
  });
});
