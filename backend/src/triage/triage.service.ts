import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { OllamaService } from '../ollama/ollama.service';

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

export interface Ticket {
  id: string;
  original_text: string;
  category: string;
  priority: string;
  sentiment: string;
  summary: string;
  product_area: string | null;
  customer_name: string | null;
  issue_description: string;
  urgency_signals: string[];
  suggested_reply: string;
  confidence: number;
  parse_error: string | null;
  created_at: string;
}

const VALID_CATEGORIES = [
  'technical_support', 'billing', 'feature_request',
  'bug_report', 'general_inquiry', 'account_issue', 'complaint',
] as const;
const VALID_PRIORITIES  = ['critical', 'high', 'medium', 'low'] as const;
const VALID_SENTIMENTS  = ['positive', 'negative', 'neutral'] as const;

/* ------------------------------------------------------------------ */
/*  Prompt                                                              */
/* ------------------------------------------------------------------ */

function buildPrompt(text: string): string {
  return `You are a customer support triage system. Analyse the message below and return ONLY a valid JSON object — no markdown fences, no explanation, no extra text.

Message:
"""
${text}
"""

Return exactly this JSON (do not add keys, do not omit any):
{
  "category": "<technical_support|billing|feature_request|bug_report|general_inquiry|account_issue|complaint>",
  "priority": "<critical|high|medium|low>",
  "sentiment": "<positive|negative|neutral>",
  "summary": "<one sentence summary>",
  "product_area": "<product/feature area or null>",
  "customer_name": "<extracted name or null>",
  "issue_description": "<concise description of the core problem>",
  "urgency_signals": ["<phrase indicating urgency>"],
  "suggested_reply": "<professional first-person reply draft>",
  "confidence": <0.0–1.0>
}

Rules:
- priority=critical only when the issue causes data loss or complete service outage
- urgency_signals may be an empty array []
- confidence reflects how certain you are of the classification`;
}

/* ------------------------------------------------------------------ */
/*  JSON extraction — resilient to malformed model output              */
/* ------------------------------------------------------------------ */

function repairTruncated(s: string): string {
  // Remove trailing comma left by a truncated last field, then close the object
  return s.replace(/,\s*$/, '') + '}';
}

function extractJson(raw: string): Record<string, any> | null {
  const attempts = [
    () => JSON.parse(raw.trim()),
    () => {
      const m = raw.match(/\{[\s\S]*\}/);
      return m ? JSON.parse(m[0]) : null;
    },
    () => {
      const stripped = raw.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
      return JSON.parse(stripped);
    },
    () => {
      // Handle truncated JSON: find the opening brace, take everything, repair and close
      const start = raw.indexOf('{');
      if (start === -1) return null;
      return JSON.parse(repairTruncated(raw.slice(start)));
    },
  ];

  for (const attempt of attempts) {
    try {
      const result = attempt();
      if (result !== null) return result;
    } catch { /* try next */ }
  }
  return null;
}

function coerce<T extends string>(val: unknown, allowed: readonly T[], fallback: T): T {
  return (allowed as readonly string[]).includes(val as string) ? (val as T) : fallback;
}

/* ------------------------------------------------------------------ */
/*  Service (in-memory store)                                           */
/* ------------------------------------------------------------------ */

@Injectable()
export class TriageService {
  private readonly logger = new Logger(TriageService.name);
  private readonly tickets: Ticket[] = [];

  constructor(private readonly ollama: OllamaService) {}

  async processTicket(text: string): Promise<Ticket> {
    const raw = await this.ollama.generate(buildPrompt(text));

    let fields: Omit<Ticket, 'id' | 'original_text' | 'created_at' | 'parse_error'>;
    let parseError: string | null = null;

    const parsed = extractJson(raw);
    if (parsed) {
      fields = {
        category:          coerce(parsed.category, VALID_CATEGORIES, 'general_inquiry'),
        priority:          coerce(parsed.priority, VALID_PRIORITIES, 'medium'),
        sentiment:         coerce(parsed.sentiment, VALID_SENTIMENTS, 'neutral'),
        summary:           typeof parsed.summary === 'string' ? parsed.summary.slice(0, 500) : 'Unable to summarise.',
        product_area:      typeof parsed.product_area === 'string' ? parsed.product_area : null,
        customer_name:     typeof parsed.customer_name === 'string' ? parsed.customer_name : null,
        issue_description: typeof parsed.issue_description === 'string' ? parsed.issue_description : '',
        urgency_signals:   Array.isArray(parsed.urgency_signals)
          ? parsed.urgency_signals.filter((s: unknown) => typeof s === 'string')
          : [],
        suggested_reply:   typeof parsed.suggested_reply === 'string'
          ? parsed.suggested_reply
          : 'Thank you for contacting us. Our team will review your message and respond shortly.',
        confidence:        typeof parsed.confidence === 'number' ? Math.min(1, Math.max(0, parsed.confidence)) : 0.5,
      };
    } else {
      this.logger.warn('Could not parse LLM output — using fallback values');
      parseError = raw.slice(0, 500);
      fields = {
        category: 'general_inquiry', priority: 'medium', sentiment: 'neutral',
        summary: 'Automated classification failed — manual review required.',
        product_area: null, customer_name: null,
        issue_description: text.slice(0, 300),
        urgency_signals: [],
        suggested_reply: 'Thank you for contacting us. A support agent will review your message and respond shortly.',
        confidence: 0,
      };
    }

    const ticket: Ticket = {
      id: uuidv4(),
      original_text: text,
      ...fields,
      parse_error: parseError,
      created_at: new Date().toISOString(),
    };

    this.tickets.unshift(ticket);
    return ticket;
  }

  listTickets(opts: { category?: string; priority?: string; page: number; limit: number }) {
    let filtered = this.tickets as Ticket[];
    if (opts.category) filtered = filtered.filter((t) => t.category === opts.category);
    if (opts.priority) filtered = filtered.filter((t) => t.priority === opts.priority);

    const total = filtered.length;
    const offset = (opts.page - 1) * opts.limit;
    const data = filtered.slice(offset, offset + opts.limit);

    return { data, total, page: opts.page, limit: opts.limit };
  }

  getTicket(id: string): Ticket | null {
    return this.tickets.find((t) => t.id === id) ?? null;
  }
}
