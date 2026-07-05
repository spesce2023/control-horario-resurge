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
    <ScheduleDaysEditor
      initialDays={initialDays}
      saveLabel="Guardar horario de esta semana"
      onSave={(days) => saveWeeklySchedule(employeeId, weekStart, days)}
    />
  );
}
