"use client";

import { useRef, useState, useTransition } from "react";
import { createManualEntry } from "./actions";

const fieldClass =
  "w-full rounded-lg border border-border bg-white px-3 py-2 text-[12.5px] text-olive outline-none focus:border-sage focus:ring-2 focus:ring-sage-bg";

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-[10.5px] font-bold uppercase tracking-wide text-secondary">
        {label}
      </label>
      {children}
    </div>
  );
}

export function AddEntryForm({
  employees,
}: {
  employees: { id: string; name: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function close() {
    setOpen(false);
    setError(null);
    formRef.current?.reset();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-lg bg-sage px-4 py-2.5 text-[12.5px] font-bold text-white sm:w-auto"
      >
        + Agregar marca manual
      </button>

      {open && (
        <div
          className="fixed inset-0 z-40 flex items-end justify-center bg-olive/35 md:items-center md:p-4"
          onClick={close}
        >
          <div
            className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-card p-5 shadow-[0_12px_30px_rgba(0,0,0,0.2)] md:max-w-[360px] md:rounded-2xl md:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-serif text-[16px] font-semibold text-olive">
              Agregar marca manual
            </h3>
            <p className="mb-4 mt-0.5 text-[10.5px] text-secondary">
              RF-12 · queda identificada como manual en el historial
            </p>

            <form
              ref={formRef}
              action={(formData: FormData) => {
                setError(null);
                startTransition(async () => {
                  const result = await createManualEntry(formData);
                  if (result?.error) setError(result.error);
                  else close();
                });
              }}
              className="space-y-3"
            >
              <FormField label="Empleado">
                <select name="employeeId" required className={fieldClass}>
                  <option value="">Elegir…</option>
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Tipo">
                <select name="type" className={fieldClass}>
                  <option value="in">Entrada</option>
                  <option value="out">Salida</option>
                </select>
              </FormField>

              <FormField label="Fecha y hora">
                <input type="datetime-local" name="occurredAt" required className={fieldClass} />
              </FormField>

              <FormField label="Nota (opcional)">
                <input
                  type="text"
                  name="notes"
                  placeholder="Ej: sin batería en el celular"
                  className={fieldClass}
                />
              </FormField>

              {error && <p className="text-[11.5px] text-danger">{error}</p>}

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={close}
                  className="rounded-lg border border-border bg-white px-4 py-2 text-[12.5px] font-semibold text-olive"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-lg bg-sage px-4 py-2 text-[12.5px] font-bold text-white disabled:opacity-50"
                >
                  {isPending ? "Guardando…" : "Agregar marca"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
