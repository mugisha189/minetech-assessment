import React, { useState } from 'react';
import type { ChatMessage } from '../../types';

interface Props {
  message: ChatMessage;
}

export function MessageBubble({ message }: Props) {
  const [showCitations, setShowCitations] = useState(false);
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] space-y-1.5 ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        {/* Bubble */}
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
            isUser
              ? 'bg-brand-600 text-white rounded-br-sm'
              : message.in_knowledge_base === false
              ? 'bg-amber-50 border border-amber-200 text-gray-800 rounded-bl-sm'
              : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm'
          }`}
        >
          {message.content}
        </div>

        {/* Out-of-KB indicator */}
        {!isUser && message.in_knowledge_base === false && (
          <span className="text-xs text-amber-600 font-medium px-1">
            ⚠ Not in knowledge base
          </span>
        )}

        {/* Citations toggle */}
        {!isUser && message.citations?.length > 0 && (
          <div className="w-full">
            <button
              onClick={() => setShowCitations(!showCitations)}
              className="text-xs text-brand-600 hover:text-brand-800 font-medium"
            >
              {showCitations ? 'Hide' : 'Show'} {message.citations.length} source{message.citations.length !== 1 ? 's' : ''}
            </button>
            {showCitations && (
              <div className="mt-1 space-y-1">
                {message.citations.map((c, i) => (
                  <div key={i} className="text-xs bg-blue-50 border border-blue-100 rounded-lg p-2 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-blue-800">{c.title}</span>
                      <span className="text-blue-500">{Math.round(c.similarity * 100)}% match</span>
                    </div>
                    <p className="text-gray-600 line-clamp-2">{c.chunk}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
