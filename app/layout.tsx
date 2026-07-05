import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Control Horario Cafetería",
  description: "Registro de entrada/salida y control horario",
  viewport: {
    width: "device-width",
    initialScale: 1,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-neutral-50 text-neutral-900 antialiased">
        {children}
      </body>
    </html>
  );
}
