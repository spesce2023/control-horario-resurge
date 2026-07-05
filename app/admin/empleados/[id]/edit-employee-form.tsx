"use client";

import { useState, useTransition } from "react";
import { updateEmployee } from "../actions";
import { EmployeeFormFields } from "../employee-form-fields";

export function EditEmployeeForm({
  employeeId,
  defaultValues,
}: {
  employeeId: string;
  defaultValues: {
    fullName: string;
    cedula: string;
    phone: string;
    mutualista: string;
    emergencyContact: string;
    weeklyHoursTarget: number;
  };
}) {
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      action={(formData: FormData) => {
        setError(null);
        setSaved(false);
        startTransition(async () => {
          const result = await updateEmployee(formData);
          if (result?.error) setError(result.error);
          else setSaved(true);
        });
      }}
      className="max-w-lg space-y-4 rounded-xl border border-neutral-200 bg-white p-6"
    >
      <input type="hidden" name="id" value={employeeId} />

      {error && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      {saved && !error && (
        <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
          Cambios guardados.
        </p>
      )}

      <EmployeeFormFields defaultValues={defaultValues} />

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md bg-neutral-900 py-3 text-base font-medium text-white disabled:opacity-50"
      >
        {isPending ? "Guardando…" : "Guardar cambios"}
      </button>
    </form>
  );
}
