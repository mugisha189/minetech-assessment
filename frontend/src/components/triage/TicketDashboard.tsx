'use client';

import { useEffect, useState, useCallback } from 'react';
import { TicketCard } from './TicketCard';
import { Spinner } from '@/components/ui/Spinner';
import { fetchTickets } from '@/services/api';
import type { Ticket } from '@/types';

const CATEGORIES = ['', 'technical_support', 'billing', 'feature_request', 'bug_report', 'general_inquiry', 'account_issue', 'complaint'];
const PRIORITIES  = ['', 'critical', 'high', 'medium', 'low'];

export function TicketDashboard({ refreshTrigger }: { refreshTrigger: number }) {
  const [tickets, setTickets]   = useState<Ticket[]>([]);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('');
  const limit = 10;

  const load = useCallback(async (p: number, cat: string, pri: string) => {
    setLoading(true); setError(null);
    try {
      const res = await fetchTickets({
        page: p, limit,
        ...(cat ? { category: cat } : {}),
        ...(pri ? { priority: pri } : {}),
      });
      setTickets(res.data);
      setTotal(res.total);
    } catch {
      setError('Failed to load tickets. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(page, category, priority); }, [page, category, priority, refreshTrigger, load]);

  const handleFilter = (cat: string, pri: string) => { setPage(1); setCategory(cat); setPriority(pri); };
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-4">
      <div className="card p-4 flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-gray-700">Filter:</span>
        <select className="select" value={category} onChange={(e) => handleFilter(e.target.value, priority)}>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c ? c.replace(/_/g, ' ') : 'All categories'}</option>)}
        </select>
        <select className="select" value={priority} onChange={(e) => handleFilter(category, e.target.value)}>
          {PRIORITIES.map((p) => <option key={p} value={p}>{p || 'All priorities'}</option>)}
        </select>
        {(category || priority) && (
          <button className="btn-secondary text-xs" onClick={() => handleFilter('', '')}>Clear</button>
        )}
        <span className="ml-auto text-sm text-gray-500">{total} ticket{total !== 1 ? 's' : ''}</span>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : error ? (
        <div className="card p-6 text-center text-red-600 text-sm">{error}</div>
      ) : tickets.length === 0 ? (
        <div className="card p-12 text-center text-gray-400 text-sm">No tickets yet. Submit a message to get started.</div>
      ) : (
        <div className="space-y-3">{tickets.map((t) => <TicketCard key={t.id} ticket={t} />)}</div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button className="btn-secondary text-xs" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>← Previous</button>
          <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
          <button className="btn-secondary text-xs" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next →</button>
        </div>
      )}
    </div>
  );
}
