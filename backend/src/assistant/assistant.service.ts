import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { OllamaService } from '../ollama/ollama.service';
import { KnowledgeService } from '../knowledge/knowledge.service';

/**
 * Cosine similarity threshold for "in knowledge base" determination.
 *
 * Decision: 0.50. nomic-embed-text scores semantically identical text at
 * 0.85–0.99 and unrelated content at 0.15–0.45, so 0.50 sits clearly in the
 * gap between the two distributions, minimising both false ignorance and
 * hallucination risk. The constant is isolated here for easy tuning.
 */
const SIMILARITY_THRESHOLD = 0.50;
const TOP_K = 5;

interface Citation {
  title: string;
  source: string | null;
  chunk: string;
  similarity: number;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations: Citation[];
  inKnowledgeBase: boolean;
  created_at: string;
}

function buildRagPrompt(question: string, chunks: { title: string; content: string }[]): string {
  const context = chunks
    .map((c, i) => `[Source ${i + 1}: ${c.title}]\n${c.content}`)
    .join('\n\n---\n\n');

  return `You are a helpful assistant. Answer the question strictly from the provided context.

CONTEXT:
${context}

QUESTION: ${question}

INSTRUCTIONS:
- Answer only from the context above.
- Cite sources inline using [Source N] notation.
- If the context does not contain enough information, say exactly: "I don't have information about that in the knowledge base."
- Do not use outside knowledge. Be concise and accurate.

ANSWER:`;
}

function buildOutOfKbPrompt(question: string): string {
  return `A user asked: "${question}"
The knowledge base does not contain relevant information to answer this.
In 1–2 sentences, politely inform the user that this topic is not covered in the available documentation and suggest they contact support directly.`;
}

@Injectable()
export class AssistantService {
  private readonly logger = new Logger(AssistantService.name);
  private readonly sessions = new Map<string, ChatMessage[]>();

  constructor(
    private readonly ollama: OllamaService,
    private readonly knowledge: KnowledgeService,
  ) {}

  createSession(): string {
    const id = uuidv4();
    this.sessions.set(id, []);
    return id;
  }

  async chat(message: string, sessionId?: string) {
    const sid = sessionId ?? this.createSession();
    if (!this.sessions.has(sid)) this.sessions.set(sid, []);

    // 1. Embed the question
    const queryEmbedding = await this.ollama.embed(message);

    // 2. Retrieve top-k chunks
    const chunks = await this.knowledge.searchChunks(queryEmbedding, TOP_K);
    const maxSim = chunks.length > 0 ? chunks[0].similarity : 0;
    const inKnowledgeBase = maxSim >= SIMILARITY_THRESHOLD;

    this.logger.debug(
      `"${message.slice(0, 50)}…" | max_sim=${maxSim.toFixed(3)} | inKB=${inKnowledgeBase}`,
    );

    // 3. Store user message
    const userMsg: ChatMessage = {
      id: uuidv4(), role: 'user', content: message,
      citations: [], inKnowledgeBase: true,
      created_at: new Date().toISOString(),
    };
    this.sessions.get(sid)!.push(userMsg);

    // 4. Generate answer
    let answer: string;
    let citations: Citation[] = [];

    if (inKnowledgeBase) {
      const relevant = chunks.filter((c) => c.similarity >= SIMILARITY_THRESHOLD);
      answer = await this.ollama.generate(
        buildRagPrompt(message, relevant.map((c) => ({ title: c.title, content: c.content }))),
      );
      citations = relevant.map((c) => ({
        title: c.title,
        source: c.source,
        chunk: c.content.slice(0, 200),
        similarity: Math.round(c.similarity * 100) / 100,
      }));
    } else {
      answer = await this.ollama.generate(buildOutOfKbPrompt(message));
    }

    // 5. Store assistant message
    const msgId = uuidv4();
    const assistantMsg: ChatMessage = {
      id: msgId, role: 'assistant', content: answer,
      citations, inKnowledgeBase,
      created_at: new Date().toISOString(),
    };
    this.sessions.get(sid)!.push(assistantMsg);

    return { sessionId: sid, messageId: msgId, answer, citations, inKnowledgeBase };
  }

  getHistory(sessionId: string): ChatMessage[] {
    return this.sessions.get(sessionId) ?? [];
  }
}
