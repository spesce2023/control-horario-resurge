const COMBINING_DIACRITICS = new RegExp("[\\u0300-\\u036f]", "g");

function stripAccents(value: string): string {
  return value.normalize("NFD").replace(COMBINING_DIACRITICS, "");
}

/**
 * Regla de negocio 13: primera letra del nombre + apellido completo,
 * en minúsculas, sin acentos ni espacios. Tomamos la primera palabra del
 * nombre completo como "nombre" y el resto como "apellido".
 * Ej: "Maria Gomez" -> "mgomez".
 */
export function baseUsername(fullName: string): string {
  const words = fullName.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";

  const [firstName, ...lastNameParts] = words;
  const lastName = lastNameParts.length > 0 ? lastNameParts.join("") : "";
  const raw = `${firstName[0]}${lastName}`;

  return stripAccents(raw)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

interface InsertResult {
  error: { code?: string; message: string } | null;
}

/**
 * Inserta un perfil probando usernames incrementales (RF-21 / regla 13) y
 * reintentando ante una violación de unicidad (código 23505 de Postgres).
 *
 * A diferencia de "chequear si existe y después insertar" (racy: dos altas
 * concurrentes pueden calcular el mismo candidato antes de que la primera
 * termine de insertar — así se rompió esto en producción con dos "Yania
 * Araujo"), acá el propio insert hace de chequeo atómico: si falla por
 * choque de username, se reintenta con el siguiente sufijo.
 */
export async function insertWithUniqueUsername(
  fullName: string,
  insert: (username: string) => Promise<InsertResult>,
  maxAttempts = 20
): Promise<{ username: string; error?: string }> {
  const base = baseUsername(fullName);
  let candidate = base;
  let suffix = 2;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const { error } = await insert(candidate);
    if (!error) return { username: candidate };

    if (error.code !== "23505") {
      return { username: candidate, error: error.message };
    }

    candidate = `${base}${suffix}`;
    suffix += 1;
  }

  return {
    username: candidate,
    error: "No se pudo generar un usuario único después de varios intentos.",
  };
}
