"use client";

import { useState, useTransition } from "react";
import { createEmployee } from "../actions";
import { EmployeeFormFields } from "../employee-form-fields";

export function NewEmployeeForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      action={(formData: FormData) => {
        setError(null);
        startTransition(async () => {
          const result = await createEmployee(formData);
          if (result?.error) setError(result.error);
        });
      }}
      className="max-w-lg space-y-4 rounded-xl border border-neutral-200 bg-white p-6"
    >
      {error && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <EmployeeFormFields />

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md bg-neutral-900 py-3 text-base font-medium text-white disabled:opacity-50"
      >
        {isPending ? "Creando…" : "Crear empleado e invitar por correo"}
      </button>
    </form>
  );
}
