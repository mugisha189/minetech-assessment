'use client';

import { useEffect, useRef, useState } from 'react';
import { Spinner } from '@/components/ui/Spinner';
import { fetchDocuments, uploadDocument, deleteDocument } from '@/services/api';
import type { KnowledgeDocument } from '@/types';

const ACCEPTED = '.docx,.xlsx,.pdf,.txt,.md';
const ACCEPTED_LABEL = 'docx · xlsx · pdf · txt · md';

function fileExt(name: string) {
  return name.slice(name.lastIndexOf('.') + 1).toUpperCase();
}

export function KnowledgePanel() {
  const [docs, setDocs]         = useState<KnowledgeDocument[]>([]);
  const [loading, setLoading]   = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [file, setFile]         = useState<File | null>(null);
  const [source, setSource]     = useState('');
  const [adding, setAdding]     = useState(false);
  const [error, setError]       = useState('');
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    try { setDocs(await fetchDocuments()); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const applyFile = (f: File) => {
    setFile(f);
    setError('');
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) applyFile(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) applyFile(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setAdding(true); setError('');
    try {
      await uploadDocument(file, undefined, source.trim() || undefined);
      setFile(null); setSource(''); setShowForm(false);
      if (inputRef.current) inputRef.current.value = '';
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Upload failed. Make sure Ollama is running.');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this document?')) return;
    await deleteDocument(id);
    await load();
  };

  const cancelForm = () => {
    setShowForm(false);
    setFile(null); setSource(''); setError('');
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="card h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="font-semibold text-gray-900 text-sm">Knowledge Base</h2>
        <button className="btn-primary text-xs py-1 px-3" onClick={() => showForm ? cancelForm() : setShowForm(true)}>
          {showForm ? 'Cancel' : '+ Add Document'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="p-4 border-b border-gray-200 space-y-3 bg-gray-50">
          {/* Drop zone */}
          <div
            className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
              dragOver ? 'border-brand-500 bg-brand-50' : 'border-gray-300 hover:border-gray-400'
            }`}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPTED}
              className="hidden"
              onChange={handleFileInput}
              disabled={adding}
            />
            {file ? (
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-800">{file.name}</p>
                <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
                <button
                  type="button"
                  className="text-xs text-red-500 hover:underline"
                  onClick={(e) => { e.stopPropagation(); setFile(null); if (inputRef.current) inputRef.current.value = ''; }}
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-xs text-gray-500">Click or drag a file here</p>
                <p className="text-xs text-gray-400">{ACCEPTED_LABEL}</p>
              </div>
            )}
          </div>

          <input
            className="input text-xs"
            placeholder="Source (optional)"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            disabled={adding}
          />

          {error && <p className="text-xs text-red-600">{error}</p>}

          <button
            type="submit"
            className="btn-primary w-full text-xs"
            disabled={adding || !file}
          >
            {adding
              ? <span className="flex items-center gap-2 justify-center"><Spinner size="sm" /> Embedding…</span>
              : 'Upload & Embed'}
          </button>
        </form>
      )}

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {loading ? (
          <div className="flex justify-center py-6"><Spinner /></div>
        ) : docs.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-6">No documents yet.<br />Upload a file or run the seed script.</p>
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
              >✕</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
