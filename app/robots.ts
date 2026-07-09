import type { MetadataRoute } from "next";

// Uso interno, no público: se le pide a todos los rastreadores que no indexen nada.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: "/",
    },
  };
}
