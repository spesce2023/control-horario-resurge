"use client";

import { useState, useTransition, useRef } from "react";
import { createManualEntry } from "./actions";

export function AddEntryForm({
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
          const result = await createManualEntry(formData);
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
        <label className="block text-xs text-neutral-500">Tipo</label>
        <select name="type" className="rounded-md border border-neutral-300 px-2 py-1.5">
          <option value="in">Entrada</option>
          <option value="out">Salida</option>
        </select>
      </div>

      <div>
        <label className="block text-xs text-neutral-500">Fecha y hora</label>
        <input
          type="datetime-local"
          name="occurredAt"
          required
          className="rounded-md border border-neutral-300 px-2 py-1.5"
        />
      </div>

      <div className="min-w-[10rem] flex-1">
        <label className="block text-xs text-neutral-500">Nota (opcional)</label>
        <input
          type="text"
          name="notes"
          placeholder="Ej: sin batería en el celular"
          className="w-full rounded-md border border-neutral-300 px-2 py-1.5"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-neutral-900 px-4 py-1.5 text-white disabled:opacity-50"
      >
        {isPending ? "Guardando…" : "Agregar marca"}
      </button>

      {error && <p className="w-full text-xs text-red-600">{error}</p>}
      {success && !error && <p className="w-full text-xs text-green-700">Marca creada.</p>}
    </form>
  );
}
