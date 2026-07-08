"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { setEmployeeActive } from "../actions";

export function DeactivateButton({
  employeeId,
  active,
}: {
  employeeId: string;
  active: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div>
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const result = await setEmployeeActive(employeeId, !active);
            if (result?.error) setError(result.error);
            else router.refresh();
          });
        }}
        className="text-[12.5px] font-semibold text-danger disabled:opacity-50"
      >
        {isPending ? "Guardando…" : active ? "Desactivar empleado" : "Reactivar empleado"}
      </button>
      {error && <p className="mt-1 text-[11.5px] text-danger">{error}</p>}
    </div>
  );
}
