import React, { useState } from 'react';
import { Spinner } from '../ui/Spinner';

const SAMPLE_TICKETS = [
  `Hi, I've been trying to log in for the past hour and keep getting "Invalid credentials" even though I just reset my password 20 minutes ago. This is blocking me from accessing critical reports before our board meeting at 2pm today. URGENT.`,
  `I think there might be a bug in the export function. When I export to CSV the dates are formatted as MM/DD/YYYY but our system expects DD/MM/YYYY. Not a big deal but would be nice to have a setting for it.`,
  `I was charged twice this month — $49 appeared on my statement on June 1st and again on June 3rd. My plan is the Starter plan. Please refund the duplicate charge. Account email: [redacted]`,
  `Would love to see a dark mode option in the dashboard! Eye strain is real after long sessions.`,
];

interface Props {
  onSubmit: (text: string) => Promise<void>;
  loading: boolean;
}

export function TicketForm({ onSubmit, loading }: Props) {
  const [text, setText] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    await onSubmit(text.trim());
    setText('');
  };

  return (
    <div className="card p-6 space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Submit Ticket</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          className="input h-36 resize-none font-mono text-xs"
          placeholder="Paste any support message, customer email, or feedback here…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={loading}
        />
        <button type="submit" className="btn-primary w-full" disabled={loading || !text.trim()}>
          {loading ? (
            <span className="flex items-center gap-2">
              <Spinner size="sm" /> Analysing…
            </span>
          ) : (
            'Triage with AI'
          )}
        </button>
      </form>

      <div>
        <p className="text-xs text-gray-500 mb-2 font-medium">Try a sample:</p>
        <div className="space-y-1">
          {SAMPLE_TICKETS.map((s, i) => (
            <button
              key={i}
              onClick={() => setText(s)}
              className="block w-full text-left text-xs text-brand-600 hover:text-brand-800 truncate px-2 py-1 rounded hover:bg-brand-50 transition-colors"
              title={s}
            >
              {i + 1}. {s.slice(0, 80)}…
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
