import type { CalendarEvent } from '../types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface AppContext {
  tasks: { text: string; completed: boolean; category: string; isMVD: boolean; estimatedMinutes: number }[];
  calendarEvents: { summary: string; start: string; end: string; allDay: boolean }[];
  xp: number;
  level: { level: number; title: string };
  streak: number;
  energyLevel: string | null;
  mvdMode: boolean;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const SYSTEM_PROMPT = `You are Spark, a warm and encouraging ADHD coach built into a dopamine-friendly task app.

Your personality:
- Supportive, warm, and understanding — never clinical or preachy
- You celebrate small wins enthusiastically
- You keep responses SHORT (2-3 sentences max for quick replies)
- For reflections and summaries you can be longer (up to a paragraph)
- You use casual, friendly language

What you know:
- The user has ADHD and benefits from dopamine-driven motivation
- You can see their tasks, calendar events, XP, level, streak, and energy level
- MVD mode = "Minimum Viable Day" — only essential tasks, for low-energy days

What you can do:
- Suggest which calendar events are worth importing as tasks
- Recommend optimal time slots for tasks based on their calendar
- Detect signs of overwhelm (too many tasks, low energy, broken streaks) and suggest MVD mode
- Give evening reflections summarizing the day's accomplishments
- Help prioritize and break down tasks
- Provide encouragement when the user is struggling

Rules:
- Never diagnose or give medical advice
- If the user seems in crisis, gently suggest professional support
- Match the user's energy — if they seem tired, be gentle; if they're hyped, match it
- Always ground your suggestions in the actual data you see (tasks, calendar, XP, etc.)`;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const API_KEY_STORAGE_KEY = 'dopamine-gemini-api-key';

export function getApiKey(): string {
  const key = localStorage.getItem(API_KEY_STORAGE_KEY);
  if (!key) throw new Error('NO_API_KEY');
  return key;
}

export function setApiKey(key: string): void {
  localStorage.setItem(API_KEY_STORAGE_KEY, key);
}

export function hasApiKey(): boolean {
  return !!localStorage.getItem(API_KEY_STORAGE_KEY);
}

export function clearApiKey(): void {
  localStorage.removeItem(API_KEY_STORAGE_KEY);
}

interface GeminiContent {
  role: 'user' | 'model';
  parts: { text: string }[];
}

function buildContents(messages: ChatMessage[], context?: AppContext): GeminiContent[] {
  const contents: GeminiContent[] = [];

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    let text = msg.content;

    // Inject context into the first user message so the model sees current state
    if (i === 0 && msg.role === 'user' && context) {
      text = formatContextPrefix(context) + text;
    }

    contents.push({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text }],
    });
  }

  return contents;
}

function formatContextPrefix(ctx: AppContext): string {
  const taskLines = ctx.tasks.map(
    (t) =>
      `- [${t.completed ? 'x' : ' '}] ${t.text} (${t.category}, ${t.estimatedMinutes}min${t.isMVD ? ', MVD' : ''})`,
  );

  const eventLines = ctx.calendarEvents.map(
    (e) =>
      `- ${e.summary} (${e.allDay ? 'all day' : `${formatTime(e.start)} – ${formatTime(e.end)}`})`,
  );

  return `[Current app state]
Level ${ctx.level.level} "${ctx.level.title}" | ${ctx.xp} XP | ${ctx.streak}-day streak | Energy: ${ctx.energyLevel ?? 'not set'} | MVD mode: ${ctx.mvdMode ? 'ON' : 'OFF'}

Today's tasks:
${taskLines.length > 0 ? taskLines.join('\n') : '(none)'}

Calendar events:
${eventLines.length > 0 ? eventLines.join('\n') : '(none)'}

User message: `;
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return iso;
  }
}

// ---------------------------------------------------------------------------
// Core API call
// ---------------------------------------------------------------------------

async function callGemini(
  systemPrompt: string,
  contents: GeminiContent[],
): Promise<string> {
  const key = getApiKey();

  const res = await fetch(`${API_URL}?key=${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Gemini API error ${res.status}: ${body}`);
  }

  const data = await res.json();
  const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) throw new Error('Empty response from Gemini');
  return text;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Send a chat message with full conversation history and app context.
 * Returns the assistant's reply text.
 */
export async function sendMessage(
  messages: ChatMessage[],
  context?: AppContext,
): Promise<string> {
  const contents = buildContents(messages, context);
  return callGemini(SYSTEM_PROMPT, contents);
}

/**
 * Takes raw calendar events and asks Gemini which ones should be imported
 * as actionable tasks (filtering out passive events like lunch, commute, etc.).
 *
 * Returns the event IDs that should become tasks.
 */
export async function smartFilterCalendarEvents(
  events: CalendarEvent[],
): Promise<string[]> {
  if (events.length === 0) return [];

  const eventList = events
    .map((e, i) => `${i}. [id=${e.id}] "${e.summary}" (${e.allDay ? 'all day' : `${formatTime(e.start)} – ${formatTime(e.end)}`})`)
    .join('\n');

  const prompt = `Here are today's calendar events. Return ONLY a JSON array of event IDs that represent actionable tasks the user should prepare for or complete. Filter OUT passive/automatic events like lunch breaks, commute, travel time, "busy" blocks, and all-day background events.

Events:
${eventList}

Respond with ONLY valid JSON — an array of id strings, e.g. ["id1","id2"]. No explanation.`;

  const contents: GeminiContent[] = [{ role: 'user', parts: [{ text: prompt }] }];
  const raw = await callGemini(SYSTEM_PROMPT, contents);

  // Parse the JSON array from the response
  try {
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed: unknown = JSON.parse(cleaned);
    if (Array.isArray(parsed) && parsed.every((v) => typeof v === 'string')) {
      return parsed as string[];
    }
  } catch {
    // If parsing fails, return all event IDs as fallback
  }

  return events.map((e) => e.id);
}

/**
 * Suggests the best time slot for a task given today's calendar events.
 * Returns a human-readable suggestion string.
 */
export async function suggestTimeSlot(
  taskText: string,
  durationMin: number,
  calendarEvents: CalendarEvent[],
): Promise<string> {
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const eventList = calendarEvents
    .map(
      (e) =>
        `- ${e.summary} (${e.allDay ? 'all day' : `${formatTime(e.start)} – ${formatTime(e.end)}`})`,
    )
    .join('\n');

  const prompt = `It's currently ${timeStr}. The user wants to schedule "${taskText}" which takes about ${durationMin} minutes.

Today's calendar:
${eventList.length > 0 ? eventList : '(no events)'}

Suggest the best time slot for this task. Consider:
- Finding gaps between calendar events
- Not scheduling over existing events
- Considering that it's already ${timeStr}
- ADHD-friendly advice (e.g., pair with a break, body-doubling suggestion)

Keep your response to 2-3 sentences.`;

  const contents: GeminiContent[] = [{ role: 'user', parts: [{ text: prompt }] }];
  return callGemini(SYSTEM_PROMPT, contents);
}
