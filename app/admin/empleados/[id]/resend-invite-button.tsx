"use client";

import { useState, useTransition } from "react";
import { resendInvite } from "../actions";

export function ResendInviteButton({ employeeId }: { employeeId: string }) {
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-1.5">
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          setMessage(null);
          startTransition(async () => {
            const result = await resendInvite(employeeId);
            setMessage(result?.error ?? "Invitación reenviada por correo.");
          });
        }}
        className="rounded-lg border border-border bg-white px-3 py-2 text-[12px] font-semibold text-olive disabled:opacity-50"
      >
        {isPending ? "Enviando…" : "Reenviar correo de bienvenida"}
      </button>
      {message && <p className="text-[11.5px] text-secondary">{message}</p>}
    </div>
  );
}
