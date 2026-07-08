"use client";

import { useState, useTransition } from "react";
import { updateEntry, deleteEntry } from "./actions";
import type { ReviewEntry } from "@/lib/attendance/review-math";

export function EntryRow({
  entry,
  displayTime,
  localInputValue,
}: {
  entry: ReviewEntry;
  displayTime: string;
  localInputValue: string;
}) {
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!editing) {
    return (
      <li className="flex flex-col gap-1.5 py-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="font-semibold text-olive">
            {entry.type === "in" ? "Entrada" : "Salida"}
          </span>{" "}
          <span className="text-secondary">{displayTime}</span>
          {entry.isManual && (
            <span className="ml-2 rounded-md bg-terracotta-bg px-1.5 py-0.5 text-[10px] font-bold text-terracotta">
              Manual
            </span>
          )}
          {entry.notes && (
            <span className="ml-2 text-[11px] italic text-secondary">{entry.notes}</span>
          )}
        </div>
        <div className="flex gap-3 text-[11.5px] font-semibold">
          <button type="button" onClick={() => setEditing(true)} className="text-sage-dark">
            Editar
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => {
              if (!window.confirm("¿Eliminar esta marca?")) return;
              setError(null);
              startTransition(async () => {
                const result = await deleteEntry(entry.id);
                if (result?.error) setError(result.error);
              });
            }}
            className="text-danger disabled:opacity-50"
          >
            Eliminar
          </button>
        </div>
        {error && <p className="w-full text-[11px] text-danger">{error}</p>}
      </li>
    );
  }

  return (
    <li className="space-y-2 py-2.5">
      <form
        action={(formData: FormData) => {
          setError(null);
          startTransition(async () => {
            const result = await updateEntry(formData);
            if (result?.error) setError(result.error);
            else setEditing(false);
          });
        }}
        className="flex flex-wrap items-end gap-2"
      >
        <input type="hidden" name="id" value={entry.id} />
        <select
          name="type"
          defaultValue={entry.type}
          className="rounded-lg border border-border px-2 py-1.5 text-[12px] text-olive"
        >
          <option value="in">Entrada</option>
          <option value="out">Salida</option>
        </select>
        <input
          type="datetime-local"
          name="occurredAt"
          defaultValue={localInputValue}
          required
          className="rounded-lg border border-border px-2 py-1.5 text-[12px] text-olive"
        />
        <input
          type="text"
          name="notes"
          placeholder="Nota (opcional)"
          defaultValue={entry.notes ?? ""}
          className="rounded-lg border border-border px-2 py-1.5 text-[12px] text-olive"
        />
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-sage px-3 py-1.5 text-[12px] font-bold text-white disabled:opacity-50"
        >
          Guardar
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="rounded-lg border border-border bg-white px-3 py-1.5 text-[12px] font-semibold text-olive"
        >
          Cancelar
        </button>
      </form>
      {error && <p className="text-[11px] text-danger">{error}</p>}
    </li>
  );
}
