"use client";

import { useRef } from "react";
import { CalendarDayHeader } from "./calendar-day-header";
import { CalendarTimeColumn } from "./calendar-time-column";
import { CalendarDayColumn } from "./calendar-day-column";
import { getDaysFromDate } from "@/utils/calendar";

const DAYS_TO_SHOW = 14;

export function Calendar() {
  const headerScrollRef = useRef<HTMLDivElement>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days = getDaysFromDate(today, DAYS_TO_SHOW);

  function handleGridScroll(event: React.UIEvent<HTMLDivElement>) {
    if (headerScrollRef.current) {
      headerScrollRef.current.scrollLeft = event.currentTarget.scrollLeft;
    }
  }

  return (
    <div className="relative flex flex-col h-full">
      <div className="sticky top-0 flex border-b border-gray-200 bg-white">
        <div className="w-16 shrink-0" />
        <div ref={headerScrollRef} className="w-0 flex-1 flex overflow-x-auto">
          {days.map((date) => (
            <CalendarDayHeader key={date.toISOString()} date={date} />
          ))}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <CalendarTimeColumn />
        <div
          className="w-0 flex-1 flex overflow-auto"
          onScroll={handleGridScroll}
        >
          {days.map((date) => (
            <CalendarDayColumn key={date.toISOString()} date={date} />
          ))}
        </div>
      </div>
    </div>
  );
}
