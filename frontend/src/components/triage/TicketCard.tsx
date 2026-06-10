'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import type { Ticket } from '@/types';

export function TicketCard({ ticket }: { ticket: Ticket }) {
  const [expanded, setExpanded] = useState(false);
  const pct = Math.round(ticket.confidence * 100);
  const confColor =
    ticket.confidence >= 0.75 ? 'text-green-600' :
    ticket.confidence >= 0.5  ? 'text-yellow-600' : 'text-red-500';

  return (
    <div className={`card p-4 space-y-3 ${ticket.parse_error ? 'border-red-200 bg-red-50' : ''}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          <Badge label={ticket.priority} />
          <Badge label={ticket.category} />
          <Badge label={ticket.sentiment} />
        </div>
        <span className={`text-xs font-medium shrink-0 ${confColor}`}>
          {ticket.parse_error ? 'parse error' : `${pct}% conf.`}
        </span>
      </div>

      <p className="text-sm font-medium text-gray-800 leading-snug">{ticket.summary}</p>

      <div className="flex flex-wrap gap-3 text-xs text-gray-500">
        {ticket.customer_name && <span><span className="font-medium">Customer:</span> {ticket.customer_name}</span>}
        {ticket.product_area  && <span><span className="font-medium">Area:</span> {ticket.product_area}</span>}
        <span>{new Date(ticket.created_at).toLocaleString()}</span>
      </div>

      {ticket.urgency_signals?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {ticket.urgency_signals.map((s, i) => (
            <span key={i} className="text-xs bg-red-50 text-red-700 border border-red-100 rounded px-1.5 py-0.5">{s}</span>
          ))}
        </div>
      )}

      <button onClick={() => setExpanded(!expanded)} className="text-xs text-brand-600 hover:text-brand-800 font-medium">
        {expanded ? 'Hide details ▲' : 'Show details ▼'}
      </button>

      {expanded && (
        <div className="space-y-3 pt-1 border-t border-gray-100">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Issue Description</p>
            <p className="text-sm text-gray-700 leading-relaxed">{ticket.issue_description}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Suggested Reply</p>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap bg-blue-50 rounded-lg p-3 border border-blue-100">
              {ticket.suggested_reply}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Original Message</p>
            <p className="text-xs text-gray-500 font-mono whitespace-pre-wrap bg-gray-50 rounded p-2">{ticket.original_text}</p>
          </div>
          {ticket.parse_error && (
            <div>
              <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-1">Parse Error (raw output)</p>
              <p className="text-xs text-red-600 font-mono bg-red-50 rounded p-2 whitespace-pre-wrap">{ticket.parse_error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
