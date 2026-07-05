"use client";

import { useState, useTransition } from "react";
import { setEmployeeActive, resendInvite } from "../actions";

export function EmployeeActions({
  employeeId,
  active,
}: {
  employeeId: string;
  active: boolean;
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-3 rounded-xl border border-neutral-200 bg-white p-6">
      <h2 className="text-sm font-semibold">Acciones</h2>

      {message && <p className="text-sm text-neutral-600">{message}</p>}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={isPending}
          onClick={() => {
            setMessage(null);
            startTransition(async () => {
              const result = await resendInvite(employeeId);
              setMessage(
                result?.error ?? "Invitación reenviada por correo."
              );
            });
          }}
          className="rounded-md border border-neutral-300 px-4 py-2 text-sm"
        >
          Reenviar invitación (RF-24)
        </button>

        <button
          type="button"
          disabled={isPending}
          onClick={() => {
            setMessage(null);
            startTransition(async () => {
              const result = await setEmployeeActive(employeeId, !active);
              setMessage(
                result?.error ??
                  (active ? "Empleado desactivado." : "Empleado reactivado.")
              );
            });
          }}
          className="rounded-md border border-neutral-300 px-4 py-2 text-sm"
        >
          {active ? "Desactivar empleado" : "Reactivar empleado"}
        </button>
      </div>
    </div>
  );
}
