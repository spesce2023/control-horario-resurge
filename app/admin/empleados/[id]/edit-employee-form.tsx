"use client";

import { useState, useTransition } from "react";
import { updateEmployee } from "../actions";
import { EmployeeFormFields } from "../employee-form-fields";
import { ResendInviteButton } from "./resend-invite-button";
import { DeactivateButton } from "./deactivate-button";

export function EditEmployeeForm({
  employeeId,
  defaultValues,
  active,
  welcomeNote,
  scheduleChips,
}: {
  employeeId: string;
  defaultValues: {
    fullName: string;
    email: string;
    username: string;
    cedula: string;
    phone: string;
    mutualista: string;
    emergencyContact: string;
    weeklyHoursTarget: number;
    hourlyRate: number;
  };
  active: boolean;
  welcomeNote: string | null;
  scheduleChips: React.ReactNode;
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
      className="space-y-5"
    >
      <input type="hidden" name="id" value={employeeId} />

      {error && (
        <p role="alert" className="rounded-md bg-danger-bg px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}
      {saved && !error && (
        <p className="rounded-md bg-sage-bg px-3 py-2 text-sm text-sage-dark">
          Cambios guardados.
        </p>
      )}

      <EmployeeFormFields
        defaultValues={defaultValues}
        accessExtra={
          <div className="space-y-2">
            {welcomeNote && (
              <p className="rounded-lg bg-sage-bg px-2.5 py-2 text-[11.5px] text-sage-dark">
                {welcomeNote}
              </p>
            )}
            <ResendInviteButton employeeId={employeeId} />
          </div>
        }
        scheduleExtra={
          <div className="space-y-1.5">
            <label className="block text-[10.5px] font-semibold uppercase tracking-wide text-secondary">
              Horario por defecto
            </label>
            {scheduleChips}
            <p className="text-[11px] text-secondary">
              Para editar la semana en curso o el horario por defecto, andá a &ldquo;Ver / editar
              horario semanal&rdquo; arriba.
            </p>
          </div>
        }
      />

      {error && (
        <p role="alert" className="rounded-md bg-danger-bg px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}
      {saved && !error && (
        <p className="rounded-md bg-sage-bg px-3 py-2 text-sm text-sage-dark">
          Cambios guardados.
        </p>
      )}

      <div className="flex items-center justify-between border-t border-border pt-4">
        <DeactivateButton employeeId={employeeId} active={active} />
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-sage px-5 py-2.5 text-[13px] font-bold text-white disabled:opacity-50"
        >
          {isPending ? "Guardando…" : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}
