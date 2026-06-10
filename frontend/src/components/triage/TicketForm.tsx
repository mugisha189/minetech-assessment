'use client';

import { useState } from 'react';
import { Spinner } from '@/components/ui/Spinner';

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
          {loading
            ? <span className="flex items-center gap-2"><Spinner size="sm" /> Analysing…</span>
            : 'Triage with AI'}
        </button>
      </form>
    </div>
  );
}
