import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CalendarEvent } from '../types';
import {
  loadGoogleScript,
  initTokenClient,
  requestAccessToken,
  refreshAccessToken,
  revokeToken,
  fetchTodayEvents,
  createCalendarEvent,
} from '../lib/googleCalendar';
import { getTodayString } from '../lib/dateUtils';

interface CalendarState {
  // Connection
  connected: boolean;
  accessToken: string | null;
  tokenExpiresAt: number | null;
  userEmail: string | null;

  // Events
  events: CalendarEvent[];
  lastSyncDate: string | null;
  syncing: boolean;
  error: string | null;

  // Actions
  connect: () => Promise<void>;
  disconnect: () => void;
  syncToday: () => Promise<void>;
  pushTaskToCalendar: (task: { text: string; startTime: string; endTime: string }) => Promise<{ success: boolean; error?: string }>;
  isTokenValid: () => boolean;
}

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

export const useCalendarStore = create<CalendarState>()(
  persist(
    (set, get) => ({
      connected: false,
      accessToken: null,
      tokenExpiresAt: null,
      userEmail: null,
      events: [],
      lastSyncDate: null,
      syncing: false,
      error: null,

      isTokenValid: () => {
        const { accessToken, tokenExpiresAt } = get();
        if (!accessToken || !tokenExpiresAt) return false;
        return Date.now() < tokenExpiresAt - 60_000; // 1 min buffer
      },

      connect: async () => {
        if (!CLIENT_ID) {
          set({ error: 'Google Client ID not configured' });
          return;
        }

        set({ error: null });

        try {
          await loadGoogleScript();
        } catch {
          set({ error: 'Failed to load Google services' });
          return;
        }

        return new Promise<void>((resolve) => {
          initTokenClient(
            CLIENT_ID,
            async (token, expiresAt) => {
              set({
                connected: true,
                accessToken: token,
                tokenExpiresAt: expiresAt,
                error: null,
              });

              // Fetch email
              try {
                const res = await fetch(
                  'https://www.googleapis.com/oauth2/v2/userinfo',
                  { headers: { Authorization: `Bearer ${token}` } },
                );
                if (res.ok) {
                  const user = await res.json();
                  set({ userEmail: user.email });
                }
              } catch { /* ignore */ }

              // Auto-sync after connecting
              await get().syncToday();
              resolve();
            },
            (error) => {
              set({ error });
              resolve();
            },
          );

          requestAccessToken();
        });
      },

      disconnect: () => {
        const { accessToken } = get();
        if (accessToken) {
          revokeToken(accessToken);
        }
        set({
          connected: false,
          accessToken: null,
          tokenExpiresAt: null,
          userEmail: null,
          events: [],
          lastSyncDate: null,
          error: null,
        });
      },

      syncToday: async () => {
        const state = get();
        if (!state.accessToken) return;

        // If token expired, try silent refresh
        if (!state.isTokenValid()) {
          if (!CLIENT_ID) return;
          try {
            await loadGoogleScript();
            initTokenClient(
              CLIENT_ID,
              async (token, expiresAt) => {
                set({ accessToken: token, tokenExpiresAt: expiresAt });
                // Retry sync with new token
                set({ syncing: true, error: null });
                try {
                  const events = await fetchTodayEvents(token);
                  set({ events, lastSyncDate: getTodayString(), syncing: false });
                } catch (err) {
                  set({ syncing: false, error: String(err) });
                }
              },
              () => {
                set({ connected: false, accessToken: null, error: 'Session expired — reconnect calendar' });
              },
            );
            refreshAccessToken();
          } catch {
            set({ error: 'Failed to refresh token' });
          }
          return;
        }

        set({ syncing: true, error: null });
        try {
          const events = await fetchTodayEvents(state.accessToken);
          set({ events, lastSyncDate: getTodayString(), syncing: false });
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          if (msg === 'TOKEN_EXPIRED') {
            set({ syncing: false });
            // Recurse with expired token path
            set({ tokenExpiresAt: 0 });
            await get().syncToday();
          } else {
            set({ syncing: false, error: msg });
          }
        }
      },

      pushTaskToCalendar: async (task) => {
        const state = get();

        if (!state.connected || !state.accessToken) {
          return { success: false, error: 'Calendar not connected' };
        }

        // If token expired, try silent refresh first
        if (!state.isTokenValid()) {
          if (!CLIENT_ID) {
            return { success: false, error: 'Google Client ID not configured' };
          }

          try {
            await loadGoogleScript();

            const refreshed = await new Promise<boolean>((resolve) => {
              initTokenClient(
                CLIENT_ID,
                (token, expiresAt) => {
                  set({ accessToken: token, tokenExpiresAt: expiresAt });
                  resolve(true);
                },
                () => {
                  set({ connected: false, accessToken: null, error: 'Session expired — reconnect calendar' });
                  resolve(false);
                },
              );
              refreshAccessToken();
            });

            if (!refreshed) {
              return { success: false, error: 'Session expired — reconnect calendar' };
            }
          } catch {
            return { success: false, error: 'Failed to refresh token' };
          }
        }

        const token = get().accessToken;
        if (!token) {
          return { success: false, error: 'No access token available' };
        }

        try {
          await createCalendarEvent(token, {
            summary: task.text,
            startTime: task.startTime,
            endTime: task.endTime,
          });
          return { success: true };
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);

          if (msg === 'TOKEN_EXPIRED') {
            // Force token expiry and retry once
            set({ tokenExpiresAt: 0 });
            return get().pushTaskToCalendar(task);
          }

          return { success: false, error: msg };
        }
      },
    }),
    {
      name: 'dopamine-calendar',
      version: 1,
      partialize: (state) => ({
        connected: state.connected,
        accessToken: state.accessToken,
        tokenExpiresAt: state.tokenExpiresAt,
        userEmail: state.userEmail,
        lastSyncDate: state.lastSyncDate,
        // Don't persist events or syncing state
      }),
    },
  ),
);
