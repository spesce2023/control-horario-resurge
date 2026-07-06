import { describe, expect, it } from "vitest";
import { formatDateDisplay } from "@/lib/week";

describe("formatDateDisplay", () => {
  it("convierte yyyy-MM-dd a dd-MM-yyyy", () => {
    expect(formatDateDisplay("2026-06-29")).toBe("29-06-2026");
    expect(formatDateDisplay("2026-07-05")).toBe("05-07-2026");
  });
});
