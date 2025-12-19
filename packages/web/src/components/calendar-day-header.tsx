import { isToday, formatWeekday } from "@/utils/calendar";

interface CalendarDayHeaderProps {
  date: Date;
}

export function CalendarDayHeader({ date }: CalendarDayHeaderProps) {
  const today = isToday(date);
  const weekday = formatWeekday(date);
  const dayNumber = date.getDate();

  return (
    <div className="flex flex-col items-center justify-center min-w-24 py-2 border-l border-gray-200">
      <span className="text-xs font-medium text-gray-500">{weekday}</span>
      <span
        className={`text-lg font-semibold ${
          today
            ? "bg-gray-900 text-white w-8 h-8 rounded-full flex items-center justify-center"
            : "text-gray-900"
        }`}
      >
        {dayNumber}
      </span>
    </div>
  );
}
