import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ChatMessage, AppContext } from '../lib/geminiAI';
import { sendMessage } from '../lib/geminiAI';
import { useTaskStore } from './useTaskStore';
import { useProgressStore } from './useProgressStore';
import { useCalendarStore } from './useCalendarStore';

const MAX_MESSAGES = 50;

interface ChatState {
  messages: ChatMessage[];
  isOpen: boolean;
  isTyping: boolean;
  hasUnread: boolean;

  sendMessage: (text: string) => Promise<void>;
  toggle: () => void;
  clearHistory: () => void;
}

function buildContext(): AppContext {
  const taskState = useTaskStore.getState();
  const progressState = useProgressStore.getState();
  const calendarState = useCalendarStore.getState();

  return {
    tasks: taskState.tasks.map((t) => ({
      text: t.text,
      completed: t.completed,
      category: t.category,
      isMVD: t.isMVD,
      estimatedMinutes: t.estimatedMinutes,
    })),
    calendarEvents: calendarState.events.map((e) => ({
      summary: e.summary,
      start: e.start,
      end: e.end,
      allDay: e.allDay,
    })),
    xp: progressState.totalXP,
    level: progressState.getCurrentLevel(),
    streak: progressState.getCurrentStreak(),
    energyLevel: taskState.todayEnergy,
    mvdMode: taskState.mvdMode,
  };
}

function trimMessages(messages: ChatMessage[]): ChatMessage[] {
  if (messages.length <= MAX_MESSAGES) return messages;
  return messages.slice(messages.length - MAX_MESSAGES);
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      messages: [],
      isOpen: false,
      isTyping: false,
      hasUnread: false,

      sendMessage: async (text: string) => {
        const userMessage: ChatMessage = {
          role: 'user',
          content: text,
          timestamp: new Date().toISOString(),
        };

        // Add user message and trim
        set((s) => ({
          messages: trimMessages([...s.messages, userMessage]),
          isTyping: true,
        }));

        try {
          const context = buildContext();
          const currentMessages = get().messages;
          const reply = await sendMessage(currentMessages, context);

          const assistantMessage: ChatMessage = {
            role: 'assistant',
            content: reply,
            timestamp: new Date().toISOString(),
          };

          set((s) => ({
            messages: trimMessages([...s.messages, assistantMessage]),
            isTyping: false,
            hasUnread: !s.isOpen,
          }));
        } catch (err) {
          const errorMessage: ChatMessage = {
            role: 'assistant',
            content:
              err instanceof Error
                ? `Sorry, I hit a snag: ${err.message}`
                : 'Sorry, something went wrong. Try again in a moment!',
            timestamp: new Date().toISOString(),
          };

          set((s) => ({
            messages: trimMessages([...s.messages, errorMessage]),
            isTyping: false,
          }));
        }
      },

      toggle: () =>
        set((s) => ({
          isOpen: !s.isOpen,
          hasUnread: s.isOpen ? s.hasUnread : false, // Clear unread when opening
        })),

      clearHistory: () => set({ messages: [] }),
    }),
    {
      name: 'dopamine-chat',
      version: 1,
      partialize: (state) => ({
        messages: state.messages,
        // Don't persist isOpen or isTyping
      }),
    },
  ),
);
