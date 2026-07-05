import { describe, expect, it } from "vitest";
import { groupByEmployeeAndDay, type ReviewEntry } from "../review-math";

function entry(overrides: Partial<ReviewEntry>): ReviewEntry {
  return {
    id: "e1",
    employeeId: "emp-1",
    type: "in",
    occurredAt: "2026-07-01T12:00:00.000Z",
    source: "qr",
    isManual: false,
    notes: null,
    ...overrides,
  };
}

const dateOf = (iso: string) => iso.slice(0, 10);

describe("groupByEmployeeAndDay", () => {
  it("agrupa por empleado y día", () => {
    const groups = groupByEmployeeAndDay(
      [
        entry({ id: "1", employeeId: "a", occurredAt: "2026-07-01T09:00:00.000Z" }),
        entry({ id: "2", employeeId: "a", type: "out", occurredAt: "2026-07-01T17:00:00.000Z" }),
        entry({ id: "3", employeeId: "b", occurredAt: "2026-07-01T09:00:00.000Z" }),
      ],
      dateOf,
      "2026-07-05"
    );

    expect(groups).toHaveLength(2);
    const empA = groups.find((g) => g.employeeId === "a")!;
    expect(empA.totalHours).toBe(8);
  });

  it("marca pendiente de revisión un día pasado con entrada abierta", () => {
    const groups = groupByEmployeeAndDay(
      [entry({ id: "1", employeeId: "a", occurredAt: "2026-07-01T09:00:00.000Z" })],
      dateOf,
      "2026-07-05"
    );
    expect(groups[0].pendingReview).toBe(true);
  });

  it("no marca pendiente si el día abierto es hoy (turno en curso)", () => {
    const groups = groupByEmployeeAndDay(
      [entry({ id: "1", employeeId: "a", occurredAt: "2026-07-05T09:00:00.000Z" })],
      dateOf,
      "2026-07-05"
    );
    expect(groups[0].pendingReview).toBe(false);
  });

  it("no marca pendiente si el día cerró correctamente", () => {
    const groups = groupByEmployeeAndDay(
      [
        entry({ id: "1", employeeId: "a", occurredAt: "2026-07-01T09:00:00.000Z" }),
        entry({ id: "2", employeeId: "a", type: "out", occurredAt: "2026-07-01T17:00:00.000Z" }),
      ],
      dateOf,
      "2026-07-05"
    );
    expect(groups[0].pendingReview).toBe(false);
  });
});
