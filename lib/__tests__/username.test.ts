import { describe, expect, it } from "vitest";
import { baseUsername, insertWithUniqueUsername } from "@/lib/username";

describe("baseUsername", () => {
  it("combina primera letra del nombre + apellido, en minúsculas", () => {
    expect(baseUsername("Maria Gomez")).toBe("mgomez");
  });

  it("quita acentos", () => {
    expect(baseUsername("José Pérez")).toBe("jperez");
  });

  it("junta apellidos compuestos sin espacios", () => {
    expect(baseUsername("Ana Maria de la Cruz")).toBe("amariadelacruz");
  });

  it("ignora espacios repetidos", () => {
    expect(baseUsername("  Juan   Perez  ")).toBe("jperez");
  });
});

describe("insertWithUniqueUsername", () => {
  it("inserta con el username base si no hay choque", async () => {
    const attempted: string[] = [];
    const result = await insertWithUniqueUsername("Maria Gomez", async (username) => {
      attempted.push(username);
      return { error: null };
    });
    expect(result).toEqual({ username: "mgomez" });
    expect(attempted).toEqual(["mgomez"]);
  });

  it("reintenta con el siguiente sufijo ante una violación de unicidad (23505)", async () => {
    const taken = new Set(["mgomez", "mgomez2"]);
    const result = await insertWithUniqueUsername("Maria Gomez", async (username) => {
      if (taken.has(username)) {
        return { error: { code: "23505", message: "duplicate key value violates unique constraint" } };
      }
      return { error: null };
    });
    expect(result).toEqual({ username: "mgomez3" });
  });

  it("no reintenta ante un error que no sea de unicidad", async () => {
    const result = await insertWithUniqueUsername("Maria Gomez", async () => ({
      error: { code: "23503", message: "foreign key violation" },
    }));
    expect(result).toEqual({ username: "mgomez", error: "foreign key violation" });
  });

  it("se rinde después de maxAttempts si siempre choca", async () => {
    const result = await insertWithUniqueUsername(
      "Maria Gomez",
      async () => ({ error: { code: "23505", message: "duplicate" } }),
      3
    );
    expect(result.error).toBeTruthy();
  });
});
