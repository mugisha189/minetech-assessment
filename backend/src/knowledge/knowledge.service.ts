import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { OllamaService } from '../ollama/ollama.service';

const CHUNK_SIZE    = 500;
const CHUNK_OVERLAP = 60;

function chunkText(text: string): string[] {
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + CHUNK_SIZE, text.length);
    chunks.push(text.slice(start, end).trim());
    if (end === text.length) break;
    start = end - CHUNK_OVERLAP;
  }
  return chunks.filter((c) => c.length > 20);
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot   += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

interface StoredDocument {
  id: string;
  title: string;
  content: string;
  source: string | null;
  chunk_count: number;
  created_at: string;
}

interface StoredChunk {
  id: string;
  document_id: string;
  title: string;
  source: string | null;
  content: string;
  embedding: number[];
}

export interface SearchResult {
  chunk_id: string;
  document_id: string;
  title: string;
  source: string | null;
  content: string;
  similarity: number;
}

@Injectable()
export class KnowledgeService {
  private readonly logger = new Logger(KnowledgeService.name);
  private readonly documents: StoredDocument[] = [];
  private readonly chunks: StoredChunk[] = [];

  constructor(private readonly ollama: OllamaService) {}

  async addDocument(title: string, content: string, source?: string) {
    const docId = uuidv4();
    const textChunks = chunkText(content);

    this.logger.log(`Embedding ${textChunks.length} chunks for "${title}"`);

    const storedChunks: StoredChunk[] = [];
    for (const text of textChunks) {
      const embedding = await this.ollama.embed(text);
      storedChunks.push({
        id: uuidv4(),
        document_id: docId,
        title,
        source: source ?? null,
        content: text,
        embedding,
      });
    }

    const doc: StoredDocument = {
      id: docId,
      title,
      content,
      source: source ?? null,
      chunk_count: storedChunks.length,
      created_at: new Date().toISOString(),
    };

    this.documents.unshift(doc);
    this.chunks.push(...storedChunks);

    return { id: docId, chunkCount: storedChunks.length };
  }

  listDocuments() {
    return this.documents.map(({ content: _content, ...rest }) => rest);
  }

  deleteDocument(id: string) {
    const idx = this.documents.findIndex((d) => d.id === id);
    if (idx !== -1) this.documents.splice(idx, 1);

    let i = this.chunks.length;
    while (i--) {
      if (this.chunks[i].document_id === id) this.chunks.splice(i, 1);
    }
  }

  async searchChunks(queryEmbedding: number[], k = 5): Promise<SearchResult[]> {
    return this.chunks
      .map((c) => ({
        chunk_id:    c.id,
        document_id: c.document_id,
        title:       c.title,
        source:      c.source,
        content:     c.content,
        similarity:  cosineSimilarity(queryEmbedding, c.embedding),
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, k);
  }
}
