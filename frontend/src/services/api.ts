import axios from 'axios';
import type { Ticket, TicketListResponse, ChatResponse, ChatMessage, KnowledgeDocument } from '@/types';

const api = axios.create({ baseURL: '/api' });

/* ------------------------------------------------------------------ */
/*  Triage                                                              */
/* ------------------------------------------------------------------ */

export async function submitTicket(text: string): Promise<Ticket> {
  const { data } = await api.post<Ticket>('/triage', { text });
  return data;
}

export async function fetchTickets(params?: {
  category?: string;
  priority?: string;
  page?: number;
  limit?: number;
}): Promise<TicketListResponse> {
  const { data } = await api.get<TicketListResponse>('/tickets', { params });
  return data;
}

/* ------------------------------------------------------------------ */
/*  Knowledge base                                                      */
/* ------------------------------------------------------------------ */

export async function fetchDocuments(): Promise<KnowledgeDocument[]> {
  const { data } = await api.get<KnowledgeDocument[]>('/knowledge');
  return data;
}

export async function addDocument(doc: {
  title: string;
  content: string;
  source?: string;
}): Promise<{ id: string; chunkCount: number }> {
  const { data } = await api.post('/knowledge', doc);
  return data;
}

export async function deleteDocument(id: string): Promise<void> {
  await api.delete(`/knowledge/${id}`);
}

/* ------------------------------------------------------------------ */
/*  Chat / RAG                                                          */
/* ------------------------------------------------------------------ */

export async function createSession(): Promise<string> {
  const { data } = await api.post<{ sessionId: string }>('/sessions');
  return data.sessionId;
}

export async function sendMessage(message: string, sessionId?: string): Promise<ChatResponse> {
  const { data } = await api.post<ChatResponse>('/chat', { message, sessionId });
  return data;
}

export async function fetchChatHistory(sessionId: string): Promise<ChatMessage[]> {
  const { data } = await api.get<ChatMessage[]>(`/chat/${sessionId}`);
  return data;
}
