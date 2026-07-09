"use client";

import { useState, useTransition } from "react";
import { createEmployee } from "../actions";
import { EmployeeFormFields } from "../employee-form-fields";
import { DefaultScheduleFields } from "./default-schedule-fields";

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

      <EmployeeFormFields
        scheduleExtra={
          <div className="space-y-1.5">
            <label className="block text-[10.5px] font-semibold uppercase tracking-wide text-secondary">
              Horario por defecto <span className="text-danger">*</span>
            </label>
            <DefaultScheduleFields />
            <p className="text-[11px] text-secondary">
              La suma de horas configurada acá tiene que coincidir exactamente con las horas
              semanales pactadas.
            </p>
          </div>
        }
      />

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
