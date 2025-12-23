export interface SyncableEvent {
  id: string;
  startTime: Date;
  endTime: Date;
  summary: string;
  description?: string;
  sourceId: string;
  sourceName?: string;
}

export interface PushResult {
  success: boolean;
  remoteId?: string;
  error?: string;
}

export interface DeleteResult {
  success: boolean;
  error?: string;
}

export interface SyncResult {
  added: number;
  removed: number;
}

export interface RemoteEvent {
  uid: string;
}

export interface ProviderConfig {
  userId: string;
}

export interface GoogleCalendarConfig extends ProviderConfig {
  accountId: string;
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: Date;
  calendarId: string;
}
