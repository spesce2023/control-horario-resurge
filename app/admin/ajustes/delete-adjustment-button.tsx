"use client";

import { useState, useTransition } from "react";
import { deleteAdjustment } from "./actions";

export function DeleteAdjustmentButton({ id }: { id: string }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="text-right">
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          if (!window.confirm("¿Eliminar este ajuste?")) return;
          setError(null);
          startTransition(async () => {
            const result = await deleteAdjustment(id);
            if (result?.error) setError(result.error);
          });
        }}
        className="text-[11.5px] font-semibold text-danger disabled:opacity-50"
      >
        Eliminar
      </button>
      {error && <p className="text-[11px] text-danger">{error}</p>}
    </div>
  );
}
