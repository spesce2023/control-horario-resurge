"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface EmployeeRow {
  id: string;
  fullName: string;
  username: string;
  weeklyHoursTarget: number;
  active: boolean;
}

function Badge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-1 text-[10.5px] font-bold ${
        active ? "bg-sage-bg text-sage-dark" : "bg-[#EAE6DC] text-secondary"
      }`}
    >
      {active ? "Activo" : "Inactivo"}
    </span>
  );
}

export function EmployeesList({ rows }: { rows: EmployeeRow[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const filtered = q
    ? rows.filter(
        (r) => r.fullName.toLowerCase().includes(q) || r.username.toLowerCase().includes(q)
      )
    : rows;

  function goTo(id: string) {
    router.push(`/admin/empleados/${id}`);
  }

  return (
    <div className="space-y-3">
      <div className="hidden justify-end sm:flex">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar empleado..."
          className="w-[190px] rounded-lg border border-border px-3 py-2 text-[12px] text-olive outline-none focus:border-sage focus:ring-2 focus:ring-sage-bg"
        />
      </div>

      {rows.length === 0 && (
        <p className="rounded-lg border border-border bg-card p-4 text-sm text-secondary">
          Todavía no hay empleados cargados.
        </p>
      )}

      {rows.length > 0 && filtered.length === 0 && (
        <p className="rounded-lg border border-border bg-card p-4 text-sm text-secondary">
          No se encontraron empleados para &ldquo;{query}&rdquo;.
        </p>
      )}

      {filtered.length > 0 && (
        <>
          {/* Desktop: tabla de 4 columnas */}
          <table className="hidden w-full border-collapse overflow-hidden rounded-[10px] border border-border bg-card text-[12.5px] md:table">
            <thead>
              <tr>
                {["Nombre", "Usuario", "Horas/sem", "Estado"].map((h) => (
                  <th
                    key={h}
                    className="bg-sage-bg px-3 py-2.5 text-left text-[10.5px] font-semibold uppercase tracking-wide text-sage-dark"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr
                  key={r.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => goTo(r.id)}
                  onKeyDown={(e) => e.key === "Enter" && goTo(r.id)}
                  className="cursor-pointer border-t border-border hover:bg-sage-bg"
                >
                  <td className="px-3 py-2.5">{r.fullName}</td>
                  <td className="px-3 py-2.5 text-secondary">@{r.username}</td>
                  <td className="px-3 py-2.5">{r.weeklyHoursTarget}h</td>
                  <td className="px-3 py-2.5">
                    <Badge active={r.active} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile: 2 columnas visuales */}
          <table className="w-full border-collapse overflow-hidden rounded-[10px] border border-border bg-card text-[12.5px] md:hidden">
            <tbody>
              {filtered.map((r) => (
                <tr
                  key={r.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => goTo(r.id)}
                  onKeyDown={(e) => e.key === "Enter" && goTo(r.id)}
                  className="cursor-pointer border-t border-border first:border-t-0 hover:bg-sage-bg"
                >
                  <td className="px-3 py-3">
                    <div className="font-medium text-olive">{r.fullName}</div>
                    <div className="mt-0.5 text-[11px] text-secondary">
                      @{r.username} · {r.weeklyHoursTarget}h
                    </div>
                  </td>
                  <td className="px-3 py-3 text-right">
                    <Badge active={r.active} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
