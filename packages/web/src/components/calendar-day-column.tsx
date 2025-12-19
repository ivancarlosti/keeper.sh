import { HOURS } from "@/utils/calendar";

interface CalendarDayColumnProps {
  date: Date;
}

export function CalendarDayColumn({ date }: CalendarDayColumnProps) {
  return (
    <div className="w-24 shrink-0 border-l border-gray-200">
      {HOURS.map((hour) => (
        <div
          key={`${date.toISOString()}-${hour}`}
          className="h-12 border-b border-gray-100 hover:bg-gray-50 transition-colors"
        />
      ))}
    </div>
  );
}
