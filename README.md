# minestech-assessment

A full-stack AI application built on a fully self-hosted LLM — no OpenAI, Anthropic, or any paid API.

## Features

| Use Case | Description |
|---|---|
| **Smart Intake Triage** | Paste any support message → the model classifies it (category + priority), extracts key fields, and drafts a reply — returned as validated JSON in a filterable dashboard |
| **Knowledge Assistant** | Ask questions grounded in your knowledge base → get answers with citations and explicit "not in knowledge base" detection |

## Architecture

```
Browser (Vite + React)
       ↕  /api  (Vite dev proxy)
NestJS backend  ←→  Ollama (local LLM)
  in-memory stores (tickets, documents + embeddings)
```

All state is in-memory — no database required.

## Tech Stack

| Layer | Choice |
|---|---|
| **LLM serving** | [Ollama](https://ollama.com) — local inference, zero cost |
| **Generation model** | `llama3.2` (3B, Q4_K_M) |
| **Embedding model** | `nomic-embed-text` (768-dim) |
| **Frontend** | Next.js 15 (App Router) + TypeScript + Tailwind CSS |
| **Backend** | NestJS + TypeScript |
| **Vector search** | Cosine similarity in TypeScript (no DB needed) |
| **Routing** | Next.js App Router (file-based, SSR-ready) |

---

## Prerequisites

- [Node.js 20+](https://nodejs.org) and [pnpm](https://pnpm.io)
- [Ollama](https://ollama.com/download) installed

---

## Quickstart (3 steps)

### 1 — Start Ollama and pull models

```bash
ollama serve                    # start Ollama (skip if it runs as a service)
ollama pull llama3.2            # ~2 GB, one-time
ollama pull nomic-embed-text    # ~274 MB, one-time
```

Verify: `ollama list` should show both models.

### 2 — Start the backend

```bash
cd backend
cp .env.example .env
pnpm install
pnpm run start:dev
# → http://localhost:3001/api
```

### 3 — Start the frontend

```bash
cd frontend
pnpm install
pnpm run dev
# → http://localhost:3000
```

Open **http://localhost:3000** — you're done.

---

## Seed the knowledge base (optional but recommended)

The Knowledge Assistant works on whatever documents you add through the UI.
For a quick start, run the seed script to load 5 sample help-center documents:

```bash
# With the backend already running:
node scripts/seed-knowledge.js
```

Documents are stored in-memory and lost when the backend restarts.
Re-run the seed script after each restart, or add your own documents via the UI.

---

## Environment variables (`backend/.env`)

| Variable | Default | Description |
|---|---|---|
| `OLLAMA_BASE_URL` | `http://localhost:11434` | Ollama API endpoint |
| `OLLAMA_GENERATION_MODEL` | `llama3.2` | Text generation model |
| `OLLAMA_EMBEDDING_MODEL` | `nomic-embed-text` | Embedding model |
| `PORT` | `3001` | Backend port |

---

## API reference

### Triage

| Method | Path | Body / Query | Description |
|---|---|---|---|
| `POST` | `/api/triage` | `{ text }` | Classify + extract + draft reply |
| `GET` | `/api/tickets` | `?category=&priority=&page=&limit=` | List tickets |
| `GET` | `/api/tickets/:id` | — | Single ticket |

### Knowledge base

| Method | Path | Body | Description |
|---|---|---|---|
| `POST` | `/api/knowledge` | `{ title, content, source? }` | Add + embed document |
| `GET` | `/api/knowledge` | — | List documents |
| `DELETE` | `/api/knowledge/:id` | — | Remove document |

### Chat (RAG)

| Method | Path | Body | Description |
|---|---|---|---|
| `POST` | `/api/sessions` | — | Create session |
| `POST` | `/api/chat` | `{ message, sessionId? }` | Send message |
| `GET` | `/api/chat/:sessionId` | — | Chat history |

---

## Triage JSON schema

```json
{
  "id": "uuid",
  "category": "technical_support | billing | feature_request | bug_report | general_inquiry | account_issue | complaint",
  "priority": "critical | high | medium | low",
  "sentiment": "positive | negative | neutral",
  "summary": "one-sentence summary",
  "product_area": "string | null",
  "customer_name": "string | null",
  "issue_description": "detailed description",
  "urgency_signals": ["phrase 1"],
  "suggested_reply": "draft reply",
  "confidence": 0.0,
  "parse_error": "null or raw LLM output if parsing failed",
  "created_at": "ISO timestamp"
}
```

---

## Project structure

```
minestech-assessment/
├── scripts/
│   └── seed-knowledge.js      # Populate sample KB documents
├── backend/                   # NestJS API (port 3001)
│   └── src/
│       ├── ollama/            # Ollama HTTP client
│       ├── triage/            # Use Case 1 — structured generation
│       ├── knowledge/         # Document chunking, embedding, cosine search
│       └── assistant/         # Use Case 2 — RAG chat
└── frontend/                  # Vite + React (port 5173)
    └── src/
        ├── pages/             # Home, Triage, Assistant
        ├── components/        # UI components
        ├── services/api.ts    # Axios calls
        └── types/index.ts     # Shared types
```

---

## Troubleshooting

**`LLM unavailable`** — run `ollama serve` and ensure both models are pulled.

**Slow first response** — Ollama loads the model on first call; subsequent responses are faster.

**Knowledge Assistant gives no results** — seed the knowledge base with `node scripts/seed-knowledge.js`.

**Different embedding model** — if you change `OLLAMA_EMBEDDING_MODEL`, update the vector dimension in `knowledge.service.ts` (currently 768 for `nomic-embed-text`). You must re-add all documents after changing the model.
