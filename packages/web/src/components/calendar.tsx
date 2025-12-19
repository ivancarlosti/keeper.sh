"use client";

import { useRef } from "react";
import { CalendarDayHeader } from "./calendar-day-header";
import { getDaysFromDate, HOURS, formatHour } from "@/utils/calendar";
import {
  calendarScroll,
  calendarGrid,
  calendarRow,
  calendarCell,
  calendarEvent,
} from "@/styles";

export interface CalendarEvent {
  id: string;
  startTime: Date;
  endTime: Date;
  title?: string;
  calendarId?: string;
}

export interface CalendarProps {
  events?: CalendarEvent[];
  startDate?: Date;
  daysToShow?: number;
}

type EventColor = "blue" | "green" | "purple" | "orange";

const CALENDAR_COLORS: EventColor[] = ["blue", "green", "purple", "orange"];

function getEventColor(calendarId?: string): EventColor {
  if (!calendarId) return "blue";
  const hash = calendarId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return CALENDAR_COLORS[hash % CALENDAR_COLORS.length];
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

declare module "react" {
  interface CSSProperties {
    "--days"?: number;
    "--event-top"?: string;
    "--event-height"?: string;
  }
}

export function Calendar({
  events = [],
  startDate = new Date(),
  daysToShow = 14,
}: CalendarProps) {
  const headerScrollRef = useRef<HTMLDivElement>(null);

  const normalizedStartDate = new Date(startDate);
  normalizedStartDate.setHours(0, 0, 0, 0);

  const days = getDaysFromDate(normalizedStartDate, daysToShow);

  function handleBodyScroll(event: React.UIEvent<HTMLDivElement>) {
    if (headerScrollRef.current) {
      headerScrollRef.current.scrollLeft = event.currentTarget.scrollLeft;
    }
  }

  function getEventsForCell(date: Date, hour: number): CalendarEvent[] {
    return events.filter((event) => {
      const eventStart = new Date(event.startTime);
      return isSameDay(eventStart, date) && eventStart.getHours() === hour;
    });
  }

  function getEventPosition(event: CalendarEvent): { top: string; height: string } {
    const start = new Date(event.startTime);
    const end = new Date(event.endTime);

    const startMinutes = start.getMinutes();
    const durationMs = end.getTime() - start.getTime();
    const durationHours = durationMs / (1000 * 60 * 60);

    const top = `${(startMinutes / 60) * 100}%`;
    const height = `${Math.max(durationHours * 100, 25)}%`;

    return { top, height };
  }

  return (
    <div className="w-full">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div
          ref={headerScrollRef}
          className={calendarScroll({ hideScrollbar: true })}
        >
          <div className={calendarGrid()} style={{ "--days": daysToShow }}>
            {days.map((date) => (
              <CalendarDayHeader key={date.toISOString()} date={date} />
            ))}
          </div>
        </div>
      </div>

      <div className={calendarScroll()} onScroll={handleBodyScroll}>
        <div className={calendarGrid()} style={{ "--days": daysToShow }}>
          {HOURS.map((hour) => (
            <div
              key={hour}
              className={calendarRow({ showTime: hour > 0 })}
              {...(hour > 0 && { "data-time": formatHour(hour) })}
            >
              {days.map((date) => {
                const cellEvents = getEventsForCell(date, hour);
                return (
                  <div
                    key={`${date.toISOString()}-${hour}`}
                    className={`${calendarCell()} relative`}
                  >
                    {cellEvents.map((event) => {
                      const { top, height } = getEventPosition(event);
                      return (
                        <div
                          key={event.id}
                          className={calendarEvent({ color: getEventColor(event.calendarId) })}
                          style={{ "--event-top": top, "--event-height": height, top: `var(--event-top)`, height: `var(--event-height)` }}
                          title={event.title}
                        >
                          {event.title}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
