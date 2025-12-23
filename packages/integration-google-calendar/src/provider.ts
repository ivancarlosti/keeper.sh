import {
  CalendarProvider,
  type SyncableEvent,
  type PushResult,
  type DeleteResult,
} from "@keeper.sh/integrations";

const GOOGLE_CALENDAR_API = "https://www.googleapis.com/calendar/v3/";

interface GoogleEventResource {
  id?: string;
  iCalUID?: string;
  summary: string;
  description?: string;
  start: { dateTime: string; timeZone?: string };
  end: { dateTime: string; timeZone?: string };
}

interface GoogleApiError {
  error?: { message?: string };
}

export class GoogleCalendarProvider extends CalendarProvider {
  readonly name = "Google Calendar";
  readonly id = "google";

  private get calendarId(): string {
    return this.config.calendarId ?? "primary";
  }

  private get headers(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.config.accessToken}`,
      "Content-Type": "application/json",
    };
  }

  async pushEvents(events: SyncableEvent[]): Promise<PushResult[]> {
    return Promise.all(events.map((event) => this.pushEvent(event)));
  }

  async deleteEvents(eventIds: string[]): Promise<DeleteResult[]> {
    return Promise.all(eventIds.map((id) => this.deleteEvent(id)));
  }

  private async pushEvent(event: SyncableEvent): Promise<PushResult> {
    const uid = this.generateUid(event);
    const resource = this.toGoogleEvent(event, uid);

    try {
      const existing = await this.findEventByUid(uid);

      if (existing?.id) {
        return this.updateEvent(existing.id, resource);
      }

      return this.createEvent(resource);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  private async createEvent(
    resource: GoogleEventResource,
  ): Promise<PushResult> {
    const url = new URL(
      `calendars/${encodeURIComponent(this.calendarId)}/events`,
      GOOGLE_CALENDAR_API,
    );

    const response = await fetch(url, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify(resource),
    });

    if (!response.ok) {
      const data = (await response.json()) as GoogleApiError;
      return {
        success: false,
        error: data.error?.message ?? response.statusText,
      };
    }

    const data = (await response.json()) as GoogleEventResource;
    return { success: true, remoteId: data.id };
  }

  private async updateEvent(
    eventId: string,
    resource: GoogleEventResource,
  ): Promise<PushResult> {
    const url = new URL(
      `calendars/${encodeURIComponent(this.calendarId)}/events/${encodeURIComponent(eventId)}`,
      GOOGLE_CALENDAR_API,
    );

    const response = await fetch(url, {
      method: "PUT",
      headers: this.headers,
      body: JSON.stringify(resource),
    });

    if (!response.ok) {
      const data = (await response.json()) as GoogleApiError;
      return {
        success: false,
        error: data.error?.message ?? response.statusText,
      };
    }

    const data = (await response.json()) as GoogleEventResource;
    return { success: true, remoteId: data.id };
  }

  private async deleteEvent(uid: string): Promise<DeleteResult> {
    try {
      const existing = await this.findEventByUid(uid);

      if (!existing?.id) {
        return { success: true };
      }

      const url = new URL(
        `calendars/${encodeURIComponent(this.calendarId)}/events/${encodeURIComponent(existing.id)}`,
        GOOGLE_CALENDAR_API,
      );

      const response = await fetch(url, {
        method: "DELETE",
        headers: this.headers,
      });

      if (!response.ok && response.status !== 404) {
        const data = (await response.json()) as GoogleApiError;
        return {
          success: false,
          error: data.error?.message ?? response.statusText,
        };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  private async findEventByUid(
    uid: string,
  ): Promise<GoogleEventResource | null> {
    const url = new URL(
      `calendars/${encodeURIComponent(this.calendarId)}/events`,
      GOOGLE_CALENDAR_API,
    );

    url.searchParams.set("iCalUID", uid);

    const response = await fetch(url, {
      method: "GET",
      headers: this.headers,
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as { items?: GoogleEventResource[] };
    return data.items?.[0] ?? null;
  }

  private toGoogleEvent(
    event: SyncableEvent,
    uid: string,
  ): GoogleEventResource {
    return {
      iCalUID: uid,
      summary: event.summary,
      description: event.description,
      start: { dateTime: event.startTime.toISOString() },
      end: { dateTime: event.endTime.toISOString() },
    };
  }
}
