import { Calendar, CalendarEvent } from "@/components/calendar";

const today = new Date();

const exampleEvents: CalendarEvent[] = [
  {
    id: "1",
    title: "Team standup",
    startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0),
    endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 30),
    calendarId: "work",
  },
  {
    id: "2",
    title: "Product review",
    startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 0),
    endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 15, 30),
    calendarId: "work",
  },
  {
    id: "3",
    title: "Dentist appointment",
    startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 10, 30),
    endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 11, 30),
    calendarId: "personal",
  },
  {
    id: "4",
    title: "Lunch with Sarah",
    startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 12, 0),
    endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 13, 0),
    calendarId: "personal",
  },
  {
    id: "5",
    title: "Sprint planning",
    startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3, 10, 0),
    endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3, 12, 0),
    calendarId: "work",
  },
];

export default function DashboardPage() {
  return (
    <div className="flex-1 min-w-0 min-h-0">
      <Calendar events={exampleEvents} />
    </div>
  );
}
