import { describe, expect, it } from "vitest";
import { baseUsername, generateUniqueUsername } from "@/lib/username";

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

describe("generateUniqueUsername", () => {
  it("devuelve el username base si no hay colisión", async () => {
    const result = await generateUniqueUsername("Maria Gomez", async () => false);
    expect(result).toBe("mgomez");
  });

  it("agrega un dígito incremental ante colisión", async () => {
    const taken = new Set(["mgomez", "mgomez2", "mgomez3"]);
    const result = await generateUniqueUsername("Maria Gomez", async (c) =>
      taken.has(c)
    );
    expect(result).toBe("mgomez4");
  });
});
