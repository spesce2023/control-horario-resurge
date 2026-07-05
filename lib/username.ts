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

/**
 * Genera un username único agregando un dígito incremental ante colisión
 * (RF-21 / regla 13), sin pedir intervención del dueño.
 */
export async function generateUniqueUsername(
  fullName: string,
  usernameExists: (candidate: string) => Promise<boolean>
): Promise<string> {
  const base = baseUsername(fullName);
  let candidate = base;
  let suffix = 2;

  while (await usernameExists(candidate)) {
    candidate = `${base}${suffix}`;
    suffix += 1;
  }

  return candidate;
}
