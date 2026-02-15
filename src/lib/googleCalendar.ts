import type { CalendarEvent } from '../types';

const SCOPES = 'https://www.googleapis.com/auth/calendar.events';
const CALENDAR_API = 'https://www.googleapis.com/calendar/v3';

let tokenClient: google.accounts.oauth2.TokenClient | null = null;

/** Load the Google Identity Services script */
export function loadGoogleScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.getElementById('google-gsi')) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.id = 'google-gsi';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
    document.head.appendChild(script);
  });
}

/** Initialize the OAuth token client */
export function initTokenClient(
  clientId: string,
  onSuccess: (token: string, expiresAt: number) => void,
  onError: (error: string) => void,
): void {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: SCOPES,
    callback: (response) => {
      if (response.error) {
        onError(response.error);
        return;
      }
      const expiresAt = Date.now() + (response.expires_in ?? 3600) * 1000;
      onSuccess(response.access_token, expiresAt);
    },
    error_callback: (error) => {
      onError(error.message ?? 'OAuth error');
    },
  });
}

/** Trigger the Google sign-in popup */
export function requestAccessToken(): void {
  if (!tokenClient) throw new Error('Token client not initialized');
  tokenClient.requestAccessToken({ prompt: 'consent' });
}

/** Silently refresh if user already granted access */
export function refreshAccessToken(): void {
  if (!tokenClient) return;
  tokenClient.requestAccessToken({ prompt: '' });
}

/** Revoke the current token */
export function revokeToken(token: string): void {
  google.accounts.oauth2.revoke(token, () => {});
}

/** Fetch today's events from all calendars */
export async function fetchTodayEvents(accessToken: string): Promise<CalendarEvent[]> {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

  const timeMin = startOfDay.toISOString();
  const timeMax = endOfDay.toISOString();

  // Get list of calendars
  const calListRes = await fetch(`${CALENDAR_API}/users/me/calendarList`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!calListRes.ok) {
    if (calListRes.status === 401) throw new Error('TOKEN_EXPIRED');
    throw new Error(`Calendar list failed: ${calListRes.status}`);
  }

  const calList = await calListRes.json();
  const calendars: Array<{ id: string; summary: string; backgroundColor: string }> = calList.items ?? [];

  // Fetch events from each calendar in parallel
  const allEvents: CalendarEvent[] = [];

  await Promise.all(
    calendars.map(async (cal) => {
      const params = new URLSearchParams({
        timeMin,
        timeMax,
        singleEvents: 'true',
        orderBy: 'startTime',
        maxResults: '50',
      });

      const res = await fetch(
        `${CALENDAR_API}/calendars/${encodeURIComponent(cal.id)}/events?${params}`,
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );

      if (!res.ok) return;
      const data = await res.json();

      for (const item of data.items ?? []) {
        if (item.status === 'cancelled') continue;

        const isAllDay = !!item.start?.date;
        allEvents.push({
          id: item.id,
          summary: item.summary ?? '(No title)',
          start: item.start?.dateTime ?? item.start?.date ?? '',
          end: item.end?.dateTime ?? item.end?.date ?? '',
          allDay: isAllDay,
          calendarName: cal.summary,
          calendarColor: cal.backgroundColor ?? '#3b82f6',
        });
      }
    }),
  );

  // Sort by start time
  allEvents.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  return allEvents;
}

/** Create an event on the user's primary calendar */
export async function createCalendarEvent(
  accessToken: string,
  event: {
    summary: string;
    description?: string;
    startTime: string; // ISO datetime
    endTime: string;   // ISO datetime
  },
): Promise<{ id: string; htmlLink: string }> {
  const res = await fetch(`${CALENDAR_API}/calendars/primary/events`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      summary: event.summary,
      description: event.description,
      start: { dateTime: event.startTime },
      end: { dateTime: event.endTime },
    }),
  });

  if (!res.ok) {
    if (res.status === 401) throw new Error('TOKEN_EXPIRED');
    throw new Error(`Failed to create event: ${res.status}`);
  }

  const data = await res.json();
  return { id: data.id, htmlLink: data.htmlLink };
}

// Type augmentation for Google Identity Services
declare global {
  namespace google.accounts.oauth2 {
    interface TokenClient {
      requestAccessToken(config?: { prompt?: string }): void;
    }
    interface TokenResponse {
      access_token: string;
      expires_in?: number;
      error?: string;
    }
    interface ErrorResponse {
      message?: string;
    }
    function initTokenClient(config: {
      client_id: string;
      scope: string;
      callback: (response: TokenResponse) => void;
      error_callback?: (error: ErrorResponse) => void;
    }): TokenClient;
    function revoke(token: string, callback: () => void): void;
  }
}
