import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';

@Injectable()
export class OllamaService {
  private readonly logger = new Logger(OllamaService.name);
  private readonly baseUrl: string;
  private readonly generationModel: string;
  private readonly embeddingModel: string;

  constructor() {
    this.baseUrl = process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434';
    this.generationModel = process.env.OLLAMA_GENERATION_MODEL ?? 'llama3.2';
    this.embeddingModel = process.env.OLLAMA_EMBEDDING_MODEL ?? 'nomic-embed-text';
  }

  async generate(prompt: string, model?: string): Promise<string> {
    const targetModel = model ?? this.generationModel;
    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: targetModel, prompt, stream: false }),
      });
      if (!response.ok) {
        throw new Error(`Ollama responded ${response.status}: ${await response.text()}`);
      }
      const data = await response.json() as { response: string };
      return data.response;
    } catch (err) {
      this.logger.error(`Generation failed (${targetModel}): ${err.message}`);
      throw new ServiceUnavailableException(
        `LLM unavailable. Ensure Ollama is running and "${targetModel}" is pulled.`,
      );
    }
  }

  async embed(text: string): Promise<number[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/embeddings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: this.embeddingModel, prompt: text }),
      });
      if (!response.ok) {
        throw new Error(`Ollama embed ${response.status}: ${await response.text()}`);
      }
      const data = await response.json() as { embedding: number[] };
      return data.embedding;
    } catch (err) {
      this.logger.error(`Embedding failed: ${err.message}`);
      throw new ServiceUnavailableException(
        `Embedding unavailable. Ensure Ollama is running and "${this.embeddingModel}" is pulled.`,
      );
    }
  }

  getGenerationModel() {
    return this.generationModel;
  }
}
