'use client';

import Link from 'next/link';
import { ChatInterface } from './ChatInterface';
import { KnowledgePanel } from './KnowledgePanel';

export function AssistantPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="max-w-6xl mx-auto w-full px-4 py-6 flex flex-col flex-1 space-y-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-sm text-brand-600 hover:text-brand-800">← Home</Link>
          <h1 className="text-xl font-bold text-gray-900">Knowledge Assistant</h1>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1" style={{ minHeight: '75vh' }}>
          <div className="lg:col-span-1"><KnowledgePanel /></div>
          <div className="lg:col-span-2"><ChatInterface /></div>
        </div>
      </div>
    </div>
  );
}
