"use client";

import { useRef } from "react";
import { CalendarDayHeader } from "./calendar-day-header";
import { getDaysFromDate, HOURS, formatHour } from "@/utils/calendar";
import {
  calendarScroll,
  calendarGrid,
  calendarRow,
  calendarCell,
} from "@/styles";

const DAYS_TO_SHOW = 14;

const today = new Date();
today.setHours(0, 0, 0, 0);

declare module "react" {
  interface CSSProperties {
    "--days"?: number;
  }
}

export function Calendar() {
  const headerScrollRef = useRef<HTMLDivElement>(null);

  const days = getDaysFromDate(today, DAYS_TO_SHOW);

  function handleBodyScroll(event: React.UIEvent<HTMLDivElement>) {
    if (headerScrollRef.current) {
      headerScrollRef.current.scrollLeft = event.currentTarget.scrollLeft;
    }
  }

  return (
    <div className="w-full">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div
          ref={headerScrollRef}
          className={calendarScroll({ hideScrollbar: true })}
        >
          <div className={calendarGrid()} style={{ "--days": DAYS_TO_SHOW }}>
            {days.map((date) => (
              <CalendarDayHeader key={date.toISOString()} date={date} />
            ))}
          </div>
        </div>
      </div>

      <div className={calendarScroll()} onScroll={handleBodyScroll}>
        <div className={calendarGrid()} style={{ "--days": DAYS_TO_SHOW }}>
          {HOURS.map((hour) => (
            <div
              key={hour}
              className={calendarRow({ showTime: hour > 0 })}
              {...(hour > 0 && { "data-time": formatHour(hour) })}
            >
              {days.map((date) => (
                <div
                  key={`${date.toISOString()}-${hour}`}
                  className={calendarCell()}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
