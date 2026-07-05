import Link from "next/link";
import { signOut } from "@/lib/auth/actions";

const NAV_ITEMS = [
  { href: "/admin", label: "Inicio" },
  { href: "/admin/empleados", label: "Empleados" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3">
          <nav className="flex flex-wrap gap-4 text-sm font-medium">
            {NAV_ITEMS.map((item) => (
              <Link key={item.href} href={item.href} className="hover:underline">
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
