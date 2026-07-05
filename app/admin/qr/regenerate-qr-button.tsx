"use client";

import { useState, useTransition } from "react";
import { regenerateQr } from "./actions";

export function RegenerateQrButton() {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="w-full rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-700"
      >
        Regenerar QR
      </button>
    );
  }

  return (
    <div className="space-y-2 text-left">
      {error && <p className="text-sm text-red-700">{error}</p>}
      <p className="text-sm text-red-700">
        ¿Seguro? El QR impreso actual dejará de funcionar de inmediato.
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={isPending}
          onClick={() => {
            setError(null);
            startTransition(async () => {
              const result = await regenerateQr();
              if (result?.error) {
                setError(result.error);
              } else {
                setConfirming(false);
              }
            });
          }}
          className="flex-1 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {isPending ? "Regenerando…" : "Sí, regenerar"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="flex-1 rounded-md border border-neutral-300 px-4 py-2 text-sm"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
