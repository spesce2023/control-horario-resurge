import { AdminNav } from "@/components/admin-nav";

// Todo el panel del dueño es dinámico: depende de la sesión y, en el caso
// del QR, puede tener efectos secundarios (crear el primer token). Nunca
// debe pre-renderizarse de forma estática en el build.
export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-cream">
      <AdminNav />
      <div className="mx-auto max-w-[1100px] px-4 py-5 md:px-6 md:py-6">{children}</div>
    </div>
  );
}
