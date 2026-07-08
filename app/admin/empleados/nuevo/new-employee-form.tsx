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
      className="space-y-5"
    >
      {error && (
        <p role="alert" className="rounded-md bg-danger-bg px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      <EmployeeFormFields />

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-sage py-3 text-[14px] font-bold text-white disabled:opacity-50"
      >
        {isPending ? "Creando…" : "Crear empleado e invitar por correo"}
      </button>
    </form>
  );
}
