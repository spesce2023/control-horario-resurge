"use client";

import { useRef, useState, useTransition } from "react";
import { createAdjustment } from "./actions";

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
      className="flex flex-wrap items-end gap-2 text-sm"
    >
      <div>
        <label className="block text-xs text-neutral-500">Empleado</label>
        <select
          name="employeeId"
          required
          className="rounded-md border border-neutral-300 px-2 py-1.5"
        >
          <option value="">Elegir…</option>
          {employees.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs text-neutral-500">Semana (cualquier día de esa semana)</label>
        <input
          type="date"
          name="date"
          required
          className="rounded-md border border-neutral-300 px-2 py-1.5"
        />
      </div>

      <div>
        <label className="block text-xs text-neutral-500">Horas (+ o −)</label>
        <input
          type="number"
          name="hoursDelta"
          step="0.25"
          required
          placeholder="ej: -2 o 3.5"
          className="w-28 rounded-md border border-neutral-300 px-2 py-1.5"
        />
      </div>

      <div className="min-w-[12rem] flex-1">
        <label className="block text-xs text-neutral-500">Concepto</label>
        <input
          type="text"
          name="concept"
          required
          placeholder="Ej: feriado trabajado"
          className="w-full rounded-md border border-neutral-300 px-2 py-1.5"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-neutral-900 px-4 py-1.5 text-white disabled:opacity-50"
      >
        {isPending ? "Guardando…" : "Agregar ajuste"}
      </button>

      {error && <p className="w-full text-xs text-red-600">{error}</p>}
      {success && !error && <p className="w-full text-xs text-green-700">Ajuste creado.</p>}
    </form>
  );
}
