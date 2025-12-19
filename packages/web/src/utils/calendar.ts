export const HOURS = Array.from({ length: 24 }, (_, index) => index);

export function getDaysFromDate(startDate: Date, count: number) {
  return Array.from({ length: count }, (_, offset) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + offset);
    return date;
  });
}

export function isToday(date: Date) {
  return new Date().toDateString() === date.toDateString();
}

export function formatWeekday(date: Date) {
  return date.toLocaleDateString("en-US", { weekday: "short" });
}

export function formatHour(hour: number) {
  if (hour === 0) return "12 AM";
  if (hour === 12) return "12 PM";
  return hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
}
