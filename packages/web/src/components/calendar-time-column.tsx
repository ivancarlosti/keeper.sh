import { HOURS, formatHour } from "@/utils/calendar";

export function CalendarTimeColumn() {
  return (
    <div className="w-16 shrink-0">
      {HOURS.map((hour) => (
        <div
          key={hour}
          className="h-12 flex items-start justify-end pr-2 -mt-2"
        >
          <span className="text-xs text-gray-500">{formatHour(hour)}</span>
        </div>
      ))}
    </div>
  );
}
