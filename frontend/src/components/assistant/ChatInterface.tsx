'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import { Spinner } from '@/components/ui/Spinner';
import { sendMessage } from '@/services/api';
import type { ChatMessage } from '@/types';

const SAMPLES = [
  'How do I reset my password?',
  'What payment methods do you accept?',
  'How do I enable two-factor authentication?',
  'What is the API rate limit for the free tier?',
  'What happens if my payment fails?',
  'How do I export my data?',
  'What is the refund policy?',
  'How do I cancel my subscription?',
];

export function ChatInterface() {
  const [messages, setMessages]   = useState<ChatMessage[]>([]);
  const [input, setInput]         = useState('');
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    setError('');
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(), role: 'user', content: text,
      citations: [], inKnowledgeBase: true, created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await sendMessage(text, sessionId);
      if (!sessionId) setSessionId(res.sessionId);
      setMessages((prev) => [...prev, {
        id: res.messageId, role: 'assistant', content: res.answer,
        citations: res.citations, inKnowledgeBase: res.inKnowledgeBase,
        created_at: new Date().toISOString(),
      }]);
    } catch {
      setError('Request failed. Is the backend running?');
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); }
  };

  return (
    <div className="card flex flex-col h-full">
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-gray-900 text-sm">Knowledge Assistant</h2>
          <p className="text-xs text-gray-400">Grounded answers with citations</p>
        </div>
        <button onClick={() => { setMessages([]); setSessionId(undefined); setError(''); }} className="btn-secondary text-xs py-1 px-3">
          New chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-400 text-center pt-4">Ask me anything about the knowledge base.</p>
            <div className="grid grid-cols-1 gap-2">
              {SAMPLES.map((q, i) => (
                <button key={i} onClick={() => send(q)} className="text-left text-xs text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-100 rounded-lg px-3 py-2 transition-colors">
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m) => <MessageBubble key={m.id} message={m} />)}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <Spinner size="sm" />
            </div>
          </div>
        )}
        {error && <p className="text-xs text-red-500 text-center">{error}</p>}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <textarea
            className="input flex-1 resize-none text-sm"
            style={{ height: 60 }}
            placeholder="Ask a question… (Enter to send, Shift+Enter for new line)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            rows={2}
          />
          <button onClick={() => send(input)} className="btn-primary px-4 self-end" disabled={loading || !input.trim()}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
