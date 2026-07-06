import Link from "next/link";
import { signOut } from "@/lib/auth/actions";

// Todo el panel del dueño es dinámico: depende de la sesión y, en el caso
// del QR, puede tener efectos secundarios (crear el primer token). Nunca
// debe pre-renderizarse de forma estática en el build.
export const dynamic = "force-dynamic";

const NAV_ITEMS = [
  { href: "/admin", label: "Inicio" },
  { href: "/admin/empleados", label: "Empleados" },
  { href: "/admin/marcas", label: "Marcas" },
  { href: "/admin/ajustes", label: "Ajustes" },
  { href: "/admin/qr", label: "QR" },
  { href: "/admin/reportes", label: "Reportes" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3">
          <nav className="flex flex-wrap gap-4 text-sm font-medium">
            {NAV_ITEMS.map((item) => (
              // prefetch={false}: estas páginas son dinámicas y algunas
              // (QR) tienen efectos secundarios (crear el token inicial);
              // no queremos que Next.js las ejecute en segundo plano solo
              // porque el link está visible en el menú.
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                className="hover:underline"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <form action={signOut}>
            <button type="submit" className="text-sm text-neutral-500 underline">
              Salir
            </button>
          </form>
        </div>
      </header>
      <div className="mx-auto max-w-4xl p-4">{children}</div>
    </div>
  );
}
