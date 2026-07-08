"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/lib/auth/actions";
import { BrandMark } from "./brand";

const NAV_ITEMS = [
  { href: "/admin", label: "Inicio" },
  { href: "/admin/empleados", label: "Empleados" },
  { href: "/admin/marcas", label: "Marcas" },
  { href: "/admin/ajustes", label: "Ajustes" },
  { href: "/admin/qr", label: "QR" },
  { href: "/admin/reportes", label: "Reportes" },
];

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname.startsWith(href);
}

export function AdminNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop: navbar horizontal completo */}
      <header className="hidden border-b border-border bg-card md:block">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-6 px-6 py-3.5">
          <BrandMark size={20} wordmarkSize="text-base" />
          <nav className="flex gap-5">
            {NAV_ITEMS.map((item) => (
              // prefetch={false}: estas páginas son dinámicas y algunas
              // (QR) tienen efectos secundarios (crear el token inicial);
              // no queremos que Next.js las ejecute en segundo plano solo
              // porque el link está visible en el menú.
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                className={`border-b-2 pb-1 pt-1 text-[13.5px] font-semibold transition-colors ${
                  isActive(pathname, item.href)
                    ? "border-sage text-sage-dark"
                    : "border-transparent text-olive hover:text-sage-dark"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-lg border border-border bg-transparent px-3 py-1.5 text-[12.5px] text-secondary"
            >
              Salir
            </button>
          </form>
        </div>
      </header>

      {/* Mobile: topbar compacto + hamburguesa */}
      <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3 md:hidden">
        <BrandMark size={20} wordmarkSize="text-base" />
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Abrir menú"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-white text-base"
        >
          ☰
        </button>
      </header>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-olive/35 md:hidden"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="ml-auto flex h-full w-[78%] flex-col bg-sage-dark p-6">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Cerrar menú"
              className="mb-5 self-end text-xl text-cream"
            >
              ✕
            </button>
            <BrandMark light size={20} wordmarkSize="text-base" />
            <nav className="mt-6 flex flex-1 flex-col gap-1">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={false}
                  onClick={() => setOpen(false)}
                  className={`rounded-lg px-2 py-3 text-[15px] font-semibold ${
                    isActive(pathname, item.href)
                      ? "bg-white/[0.16] text-white"
                      : "text-[#E9EEDF] hover:bg-white/[0.08]"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <form action={signOut}>
              <button
                type="submit"
                className="mt-auto w-full rounded-lg border border-white/30 py-2.5 text-[13px] text-[#E9EEDF]"
              >
                Salir
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
