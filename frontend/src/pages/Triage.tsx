import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { TicketForm } from '../components/triage/TicketForm';
import { TicketDashboard } from '../components/triage/TicketDashboard';
import { submitTicket } from '../services/api';

export function Triage() {
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [lastError, setLastError] = useState<string | null>(null);

  const handleSubmit = async (text: string) => {
    setLoading(true);
    setLastError(null);
    try {
      await submitTicket(text);
      setRefreshTrigger((n) => n + 1);
    } catch (err: any) {
      setLastError(err?.response?.data?.message ?? 'Triage failed. Is Ollama running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Nav */}
        <div className="flex items-center gap-3">
          <Link to="/" className="text-sm text-brand-600 hover:text-brand-800">← Home</Link>
          <h1 className="text-xl font-bold text-gray-900">Smart Intake Triage</h1>
        </div>

        {lastError && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
            {lastError}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Submit form (sidebar) */}
          <div className="lg:col-span-1">
            <TicketForm onSubmit={handleSubmit} loading={loading} />
          </div>

          {/* Dashboard (main area) */}
          <div className="lg:col-span-2">
            <TicketDashboard refreshTrigger={refreshTrigger} />
          </div>
        </div>
      </div>
    </div>
  );
}
