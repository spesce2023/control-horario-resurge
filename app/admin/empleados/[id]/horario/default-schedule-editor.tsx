"use client";

import { ScheduleDaysEditor } from "@/components/schedule-days-editor";
import type { ScheduleDay } from "@/lib/supabase/types";
import { saveDefaultSchedule } from "./actions";

export function DefaultScheduleEditor({
  employeeId,
  initialDays,
}: {
  employeeId: string;
  initialDays: ScheduleDay[];
}) {
  return (
    // key={employeeId}: mismo motivo que en WeeklyScheduleEditor — al navegar
    // de la página de horario de un empleado a la de otro (misma ruta con
    // distinto id), sin esto el editor conservaría el horario por defecto
    // del empleado anterior.
    <ScheduleDaysEditor
      key={employeeId}
      initialDays={initialDays}
      saveLabel="Guardar horario por defecto"
      variant="secondary"
      onSave={(days) => saveDefaultSchedule(employeeId, days)}
    />
  );
}
