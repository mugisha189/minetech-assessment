'use client';

import { useState } from 'react';
import Link from 'next/link';
import { TicketForm } from './TicketForm';
import { TicketDashboard } from './TicketDashboard';
import { submitTicket } from '@/services/api';

export function TriagePage() {
  const [loading, setLoading]             = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [error, setError]                 = useState<string | null>(null);

  const handleSubmit = async (text: string) => {
    setLoading(true); setError(null);
    try {
      await submitTicket(text);
      setRefreshTrigger((n) => n + 1);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Triage failed. Is Ollama running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-sm text-brand-600 hover:text-brand-800">← Home</Link>
          <h1 className="text-xl font-bold text-gray-900">Smart Intake Triage</h1>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">{error}</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <TicketForm onSubmit={handleSubmit} loading={loading} />
          </div>
          <div className="lg:col-span-2">
            <TicketDashboard refreshTrigger={refreshTrigger} />
          </div>
        </div>
      </div>
    </div>
  );
}
