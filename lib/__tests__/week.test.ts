import { describe, expect, it } from "vitest";
import { formatDateDisplay, formatHoursMinutes } from "@/lib/week";

describe("formatDateDisplay", () => {
  it("convierte yyyy-MM-dd a dd-MM-yyyy", () => {
    expect(formatDateDisplay("2026-06-29")).toBe("29-06-2026");
    expect(formatDateDisplay("2026-07-05")).toBe("05-07-2026");
  });
});

describe("formatHoursMinutes", () => {
  it("omite los minutos cuando son exactos", () => {
    expect(formatHoursMinutes(0)).toBe("0h");
    expect(formatHoursMinutes(120)).toBe("2h");
  });

  it("muestra horas y minutos cuando hay resto", () => {
    expect(formatHoursMinutes(160)).toBe("2h 40m");
    expect(formatHoursMinutes(61)).toBe("1h 1m");
  });

  it("redondea minutos fraccionarios antes de formatear", () => {
    expect(formatHoursMinutes(159.6)).toBe("2h 40m");
  });
});
