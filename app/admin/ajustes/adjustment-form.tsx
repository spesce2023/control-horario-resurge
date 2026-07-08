"use client";

import { useRef, useState, useTransition } from "react";
import { createAdjustment } from "./actions";

const fieldClass =
  "w-full rounded-lg border border-border bg-white px-3 py-2 text-[12.5px] text-olive outline-none focus:border-sage focus:ring-2 focus:ring-sage-bg";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-[10.5px] font-bold uppercase tracking-wide text-secondary">
        {label}
      </label>
      {children}
    </div>
  );
}

export function AdjustmentForm({
  employees,
}: {
  employees: { id: string; name: string }[];
}) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={(formData: FormData) => {
        setError(null);
        setSuccess(false);
        startTransition(async () => {
          const result = await createAdjustment(formData);
          if (result?.error) {
            setError(result.error);
          } else {
            setSuccess(true);
            formRef.current?.reset();
          }
        });
      }}
      className="space-y-3"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Empleado">
          <select name="employeeId" required className={fieldClass}>
            <option value="">Elegir…</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Semana (cualquier día de esa semana)">
          <input type="date" name="date" required className={fieldClass} />
        </Field>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Horas (+ o −)">
          <input
            type="number"
            name="hoursDelta"
            step="0.25"
            required
            placeholder="ej: -2 o 3.5"
            className={fieldClass}
          />
        </Field>

        <Field label="Concepto">
          <input
            type="text"
            name="concept"
            required
            placeholder="Ej: feriado trabajado"
            className={fieldClass}
          />
        </Field>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-sage px-4 py-2.5 text-[12.5px] font-bold text-white disabled:opacity-50 sm:w-auto"
      >
        {isPending ? "Guardando…" : "Agregar ajuste"}
      </button>

      {error && <p className="text-[11.5px] text-danger">{error}</p>}
      {success && !error && <p className="text-[11.5px] text-sage-dark">Ajuste creado.</p>}
    </form>
  );
}
