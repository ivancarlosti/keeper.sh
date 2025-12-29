export type EventTimeSlot = {
  uid: string;
  startTime: Date;
  endTime: Date;
};

export type StoredEventTimeSlot = EventTimeSlot & {
  id: string;
};

export type EventDiff = {
  toAdd: EventTimeSlot[];
  toRemove: StoredEventTimeSlot[];
};

export type SerializedIcsCalendar = {
  version: string;
  events?: Array<{
    uid?: string;
    start: { date: string };
    end?: { date: string };
    duration?: {
      weeks?: number;
      days?: number;
      hours?: number;
      minutes?: number;
      seconds?: number;
    };
  }>;
};
