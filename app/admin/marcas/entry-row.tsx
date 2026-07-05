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
      <li className="flex flex-wrap items-center justify-between gap-2 py-2">
        <div>
          <span className="font-medium">{entry.type === "in" ? "Entrada" : "Salida"}</span>{" "}
          <span className="text-neutral-600">{displayTime}</span>
          {entry.isManual && <span className="ml-2 text-xs text-neutral-400">(manual)</span>}
          {entry.notes && <span className="ml-2 text-xs text-neutral-400">— {entry.notes}</span>}
        </div>
        <div className="flex gap-3 text-xs">
          <button type="button" onClick={() => setEditing(true)} className="underline">
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
            className="text-red-600 underline disabled:opacity-50"
          >
            Eliminar
          </button>
        </div>
        {error && <p className="w-full text-xs text-red-600">{error}</p>}
      </li>
    );
  }

  return (
    <li className="space-y-2 py-2">
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
          className="rounded-md border border-neutral-300 px-2 py-1 text-sm"
        >
          <option value="in">Entrada</option>
          <option value="out">Salida</option>
        </select>
        <input
          type="datetime-local"
          name="occurredAt"
          defaultValue={localInputValue}
          required
          className="rounded-md border border-neutral-300 px-2 py-1 text-sm"
        />
        <input
          type="text"
          name="notes"
          placeholder="Nota (opcional)"
          defaultValue={entry.notes ?? ""}
          className="rounded-md border border-neutral-300 px-2 py-1 text-sm"
        />
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-neutral-900 px-3 py-1 text-sm text-white disabled:opacity-50"
        >
          Guardar
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="rounded-md border border-neutral-300 px-3 py-1 text-sm"
        >
          Cancelar
        </button>
      </form>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </li>
  );
}
