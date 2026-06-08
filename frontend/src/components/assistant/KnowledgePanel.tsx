import React, { useEffect, useState } from 'react';
import { Spinner } from '../ui/Spinner';
import { fetchDocuments, addDocument, deleteDocument } from '../../services/api';
import type { Document } from '../../types';

export function KnowledgePanel() {
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [source, setSource] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      setDocs(await fetchDocuments());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setAdding(true);
    setError('');
    try {
      await addDocument({ title: title.trim(), content: content.trim(), source: source.trim() || undefined });
      setTitle(''); setContent(''); setSource('');
      setShowForm(false);
      await load();
    } catch {
      setError('Failed to add document. Make sure Ollama is running.');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this document?')) return;
    await deleteDocument(id);
    await load();
  };

  return (
    <div className="card h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="font-semibold text-gray-900 text-sm">Knowledge Base</h2>
        <button
          className="btn-primary text-xs py-1 px-3"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : '+ Add Document'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="p-4 border-b border-gray-200 space-y-2 bg-gray-50">
          <input
            className="input text-xs"
            placeholder="Document title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={adding}
          />
          <input
            className="input text-xs"
            placeholder="Source (optional, e.g. help-center)"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            disabled={adding}
          />
          <textarea
            className="input text-xs h-28 resize-none font-mono"
            placeholder="Paste document content here…"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={adding}
          />
          {error && <p className="text-xs text-red-600">{error}</p>}
          <button type="submit" className="btn-primary w-full text-xs" disabled={adding || !title.trim() || !content.trim()}>
            {adding ? <span className="flex items-center gap-2 justify-center"><Spinner size="sm" /> Embedding…</span> : 'Add & Embed'}
          </button>
        </form>
      )}

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {loading ? (
          <div className="flex justify-center py-6"><Spinner /></div>
        ) : docs.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-6">No documents yet.<br />Add one or run the seed script.</p>
        ) : (
          docs.map((doc) => (
            <div key={doc.id} className="flex items-start gap-2 p-2 rounded-lg border border-gray-100 hover:border-gray-200 bg-white group">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-800 truncate">{doc.title}</p>
                <p className="text-xs text-gray-400">{doc.chunk_count} chunks • {doc.source ?? 'no source'}</p>
              </div>
              <button
                onClick={() => handleDelete(doc.id)}
                className="text-gray-300 hover:text-red-500 text-xs opacity-0 group-hover:opacity-100 shrink-0 transition-opacity"
                title="Delete"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
