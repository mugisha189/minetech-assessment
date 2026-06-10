export interface Ticket {
  id: string;
  original_text: string;
  category: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  sentiment: 'positive' | 'negative' | 'neutral';
  summary: string;
  product_area: string | null;
  customer_name: string | null;
  issue_description: string;
  urgency_signals: string[];
  suggested_reply: string;
  confidence: number;
  parse_error: string | null;
  created_at: string;
}

export interface TicketListResponse {
  data: Ticket[];
  total: number;
  page: number;
  limit: number;
}

export interface Citation {
  title: string;
  source: string | null;
  chunk: string;
  similarity: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations: Citation[];
  inKnowledgeBase: boolean;
  created_at: string;
}

export interface ChatResponse {
  sessionId: string;
  messageId: string;
  answer: string;
  citations: Citation[];
  inKnowledgeBase: boolean;
}

export interface KnowledgeDocument {
  id: string;
  title: string;
  source: string | null;
  chunk_count: number;
  created_at: string;
}
