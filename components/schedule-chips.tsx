import type { ScheduleDay } from "@/lib/supabase/types";

const WEEKDAY_SHORT = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export function ScheduleChips({ days }: { days: ScheduleDay[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {WEEKDAY_SHORT.map((label, i) => {
        const weekday = i + 1;
        const day = days.find((d) => d.weekday === weekday);
        return (
          <span
            key={weekday}
            className={`rounded-md px-2 py-1 text-[10.5px] font-semibold ${
              day ? "bg-sage-bg text-sage-dark" : "bg-[#EEEAE0] text-[#B8AF9E]"
            }`}
          >
            {day ? `${label} ${day.start}-${day.end}` : label}
          </span>
        );
      })}
    </div>
  );
}
