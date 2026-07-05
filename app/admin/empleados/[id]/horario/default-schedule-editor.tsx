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
    <ScheduleDaysEditor
      initialDays={initialDays}
      saveLabel="Guardar horario por defecto"
      onSave={(days) => saveDefaultSchedule(employeeId, days)}
    />
  );
}
