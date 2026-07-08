"use client";

import { useState, useTransition } from "react";
import { regenerateQr } from "./actions";

export function RegenerateQrButton() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function close() {
    setOpen(false);
    setError(null);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-lg border-[1.5px] border-terracotta px-4 py-2.5 text-[13px] font-bold text-terracotta sm:w-[220px]"
      >
        ↻ Regenerar QR
      </button>

      {open && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-olive/35 p-4"
          onClick={close}
        >
          <div
            className="w-full max-w-[320px] rounded-2xl bg-card p-5 text-center shadow-[0_12px_30px_rgba(0,0,0,0.2)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-terracotta-bg text-[20px] font-bold text-terracotta">
              !
            </div>
            <h3 className="font-serif text-[16px] font-semibold text-olive">¿Regenerar el QR?</h3>
            <p className="mb-4 mt-2 text-[12px] leading-relaxed text-secondary">
              El QR actual dejará de funcionar de inmediato. Vas a tener que reimprimir y
              reemplazar el que está pegado en el local antes de que el equipo pueda volver a
              marcar.
            </p>

            {error && <p className="mb-3 text-[11.5px] text-danger">{error}</p>}

            <div className="flex justify-center gap-2">
              <button
                type="button"
                onClick={close}
                className="rounded-lg border border-border bg-white px-4 py-2 text-[12.5px] font-semibold text-olive"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => {
                  setError(null);
                  startTransition(async () => {
                    const result = await regenerateQr();
                    if (result?.error) setError(result.error);
                    else close();
                  });
                }}
                className="rounded-lg bg-terracotta px-4 py-2 text-[12.5px] font-bold text-white disabled:opacity-50"
              >
                {isPending ? "Regenerando…" : "Sí, regenerar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
