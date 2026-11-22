import dotenv from 'dotenv';
dotenv.config();

export interface ParsedLlmBooking {
  intent: 'BOOK_RIDE' | 'CHECK_STATUS' | 'CANCEL_RIDE' | 'HELP' | 'GENERAL';
  pickupLocation?: string;
  dropLocation?: string;
  isRoundTrip: boolean;
  date?: string;
  time?: string;
  notes?: string;
  conversationalReply?: string;
  source: 'GEMINI_LLM' | 'RULE_FALLBACK';
}

export class LlmService {
  private apiKey: string;
  private model: string;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
    this.model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  }

  public hasApiKey(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 5 && !this.apiKey.includes('YOUR_'));
  }

  public async parseMessage(text: string, vipName = 'Hon. Member'): Promise<ParsedLlmBooking> {
    const raw = (text || '').trim();

    // 1. Try Gemini LLM if key is configured
    if (this.hasApiKey()) {
      try {
        const llmResult = await this.callGemini(raw, vipName);
        if (llmResult) {
          return { ...llmResult, source: 'GEMINI_LLM' };
        }
      } catch (err) {
        console.warn('[LlmService] Gemini API call failed, falling back to rule parser:', err);
      }
    }

    // 2. Deterministic rule-based fallback
    return this.fallbackRuleParser(raw);
  }

  private async callGemini(text: string, vipName: string): Promise<ParsedLlmBooking | null> {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const systemPrompt = `You are the Karnataka State Protocol Fleet AI Concierge for Hon'ble MLAs.
Today's date is ${todayStr}.
Analyze the user's WhatsApp message sent by VIP ${vipName}.
Extract the travel booking parameters accurately.

Return ONLY a valid JSON object matching this schema:
{
  "intent": "BOOK_RIDE" | "CHECK_STATUS" | "CANCEL_RIDE" | "HELP" | "GENERAL",
  "pickupLocation": string or null,
  "dropLocation": string or null,
  "isRoundTrip": boolean,
  "date": "YYYY-MM-DD" or null,
  "time": "HH:MM AM/PM" or null,
  "notes": string or null,
  "conversationalReply": string
}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              { text: `${systemPrompt}\n\nUser message: "${text}"` }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        }
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Gemini API HTTP ${res.status}: ${errText}`);
    }

    const data = await res.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) return null;

    const parsed = JSON.parse(candidateText);
    return {
      intent: parsed.intent || 'BOOK_RIDE',
      pickupLocation: parsed.pickupLocation || undefined,
      dropLocation: parsed.dropLocation || undefined,
      isRoundTrip: Boolean(parsed.isRoundTrip),
      date: parsed.date || undefined,
      time: parsed.time || undefined,
      notes: parsed.notes || text,
      conversationalReply: parsed.conversationalReply,
      source: 'GEMINI_LLM',
    };
  }

  private fallbackRuleParser(text: string): ParsedLlmBooking {
    const lower = text.toLowerCase();

    if (lower === 'status' || lower === 'my trip' || lower === 'track') {
      return { intent: 'CHECK_STATUS', isRoundTrip: false, source: 'RULE_FALLBACK' };
    }

    if (lower === 'cancel' || lower === 'cancel trip') {
      return { intent: 'CANCEL_RIDE', isRoundTrip: false, source: 'RULE_FALLBACK' };
    }

    if (lower === 'help' || lower === 'menu' || lower === 'hi' || lower === 'hello') {
      return { intent: 'HELP', isRoundTrip: false, source: 'RULE_FALLBACK' };
    }

    const hasBookingIntent =
      lower.includes('need') ||
      lower.includes('book') ||
      lower.includes('require') ||
      lower.includes('car') ||
      lower.includes('vehicle') ||
      lower.includes('from') ||
      lower.includes('to');

    // Extract pickup & drop: "from X to Y"
    const fromToMatch = text.match(/from\s+([^,]+?)\s+to\s+([^,.\n]+)/i);
    let pickup: string | undefined;
    let drop: string | undefined;

    if (fromToMatch) {
      pickup = fromToMatch[1].trim();
      drop = fromToMatch[2].trim();

      // Clean date/time keywords from destination
      const timeCleanMatch = drop.match(/^(.+?)\s+(?:tomorrow|today|at\s+\d|on\s+\d)/i);
      if (timeCleanMatch) {
        drop = timeCleanMatch[1].trim();
      }
    }

    const isRoundTrip = lower.includes('round trip') || lower.includes('return');

    // Date & Time extraction
    const today = new Date();
    let targetDate = new Date();
    if (lower.includes('tomorrow')) {
      targetDate.setDate(today.getDate() + 1);
    }
    const yyyy = targetDate.getFullYear();
    const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
    const dd = String(targetDate.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;

    const timeMatch = text.match(/(\d{1,2}(?::\d{2})?\s*(?:am|pm|hrs)?)/i);
    let timeStr = '11:00 AM';
    if (timeMatch && timeMatch[1]) {
      timeStr = timeMatch[1].toUpperCase();
      if (!timeStr.includes('AM') && !timeStr.includes('PM') && !timeStr.includes(':')) {
        timeStr += ':00';
      }
    }

    return {
      intent: hasBookingIntent && pickup && drop ? 'BOOK_RIDE' : 'GENERAL',
      pickupLocation: pickup,
      dropLocation: drop,
      isRoundTrip,
      date: dateStr,
      time: timeStr,
      notes: text,
      source: 'RULE_FALLBACK',
    };
  }
}

export const llmService = new LlmService();
