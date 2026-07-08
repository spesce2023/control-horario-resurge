"use client";

import { ScheduleDaysEditor } from "@/components/schedule-days-editor";
import type { ScheduleDay } from "@/lib/supabase/types";
import { saveWeeklySchedule } from "./actions";

export function WeeklyScheduleEditor({
  employeeId,
  weekStart,
  initialDays,
}: {
  employeeId: string;
  weekStart: string;
  initialDays: ScheduleDay[];
}) {
  return (
    // key incluye employeeId + weekStart: fuerza a remontar el editor al
    // cambiar de semana o de empleado. Sin esto, React reutiliza la
    // instancia y el estado interno (useState) queda con los días
    // anteriores, aunque la página ya esté mostrando otra semana/empleado —
    // guardando por error los datos viejos.
    <ScheduleDaysEditor
      key={`${employeeId}-${weekStart}`}
      initialDays={initialDays}
      saveLabel="Guardar horario de esta semana"
      variant="primary"
      onSave={(days) => saveWeeklySchedule(employeeId, weekStart, days)}
    />
  );
}
