import React from 'react';
import { Link } from 'react-router-dom';

export function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center space-y-10">
      <div className="space-y-3">
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Minestech Assessment</h1>
        <p className="text-gray-500 max-w-lg mx-auto">
          Self-hosted AI for support operations — powered by Llama 3.2 via Ollama.
          No external APIs, no paid services.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
        <Link to="/triage" className="card p-6 text-left hover:shadow-md transition-shadow group">
          <div className="text-3xl mb-3">🎯</div>
          <h2 className="text-lg font-semibold text-gray-900 group-hover:text-brand-700 transition-colors">
            Smart Intake Triage
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Paste any support message. The model classifies, extracts fields, and drafts a reply —
            returned as validated JSON in a filterable dashboard.
          </p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {['Structured JSON', 'Category + Priority', 'Suggested Reply', 'Graceful Fallback'].map((t) => (
              <span key={t} className="text-xs bg-gray-100 text-gray-600 rounded px-2 py-0.5">{t}</span>
            ))}
          </div>
        </Link>

        <Link to="/assistant" className="card p-6 text-left hover:shadow-md transition-shadow group">
          <div className="text-3xl mb-3">🔍</div>
          <h2 className="text-lg font-semibold text-gray-900 group-hover:text-brand-700 transition-colors">
            Knowledge Assistant
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Ask questions grounded in your knowledge base. Answers include citations and
            the model clearly states when a topic is not covered.
          </p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {['RAG Pipeline', 'Citations', 'pgvector Search', 'Out-of-KB Detection'].map((t) => (
              <span key={t} className="text-xs bg-gray-100 text-gray-600 rounded px-2 py-0.5">{t}</span>
            ))}
          </div>
        </Link>
      </div>

      <div className="card p-4 max-w-2xl w-full bg-amber-50 border-amber-200">
        <p className="text-xs text-amber-800">
          <strong>Prerequisites:</strong> Ollama running locally with{' '}
          <code className="bg-amber-100 px-1 rounded">llama3.2</code> and{' '}
          <code className="bg-amber-100 px-1 rounded">nomic-embed-text</code> pulled.
          PostgreSQL with pgvector via Docker Compose. See README for setup.
        </p>
      </div>
    </div>
  );
}
