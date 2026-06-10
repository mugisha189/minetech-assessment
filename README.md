# minestech-assessment

A full-stack AI application built on a fully self-hosted LLM — no OpenAI, Anthropic, or any paid API.

## Features

| Use Case | Description |
|---|---|
| **Smart Intake Triage** | Paste any support message → the model classifies it (category + priority), extracts key fields, and drafts a reply — returned as validated JSON in a filterable dashboard |
| **Knowledge Assistant** | Ask questions grounded in your knowledge base → get answers with citations and explicit "not in knowledge base" detection |

## Architecture

```
Browser (Next.js 15)
       ↕  /api  (Next.js rewrites proxy)
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

---

## Prerequisites

- [Node.js 20+](https://nodejs.org) and [pnpm](https://pnpm.io)
- Ollama installed (see below)

### Installing Ollama

**macOS** — download and run the official installer:
[https://ollama.com/download/mac](https://ollama.com/download/mac)

**Linux** — run the official install script:
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

**Windows** — download the installer:
[https://ollama.com/download/windows](https://ollama.com/download/windows)

---

## Quickstart (3 steps)

### 1 — Start Ollama and pull models

```bash
ollama serve                    # start Ollama (skip if it runs as a service / menu-bar app)
ollama pull llama3.2            # ~2 GB, one-time
ollama pull nomic-embed-text    # ~274 MB, one-time
```

Verify: `ollama list` should show both models.

### 2 — Install dependencies and start the backend

```bash
pnpm install                    # install all workspace packages from the root
pnpm dev:backend                # → http://localhost:3001/api
```

### 3 — Start the frontend (separate terminal)

```bash
pnpm dev:frontend               # → http://localhost:3000
```

Open **http://localhost:3000** — you're done.

---

## Seed the knowledge base (optional but recommended)

The Knowledge Assistant works on whatever documents you upload through the UI.
For a quick start, run the seed script to load 5 sample help-center documents:

```bash
# With the backend already running:
node scripts/seed-knowledge.js
```

Documents are stored in-memory and lost when the backend restarts.
Re-run the seed script after each restart, or upload your own files via the UI.

Sample files for upload (docx, xlsx, pdf, txt, md) are in `docs/`.

---

## Environment variables (`backend/.env`)

| Variable | Default | Description |
|---|---|---|
| `OLLAMA_BASE_URL` | `http://localhost:11434` | Ollama API endpoint |
| `OLLAMA_GENERATION_MODEL` | `llama3.2` | Text generation model |
| `OLLAMA_EMBEDDING_MODEL` | `nomic-embed-text` | Embedding model |
| `PORT` | `3001` | Backend port |

Copy `backend/.env.example` to `backend/.env` to override any of these.

---

## API reference

### Triage

| Method | Path | Body / Query | Description |
|---|---|---|---|
| `POST` | `/api/triage` | `{ text }` | Classify + extract + draft reply |
| `GET` | `/api/tickets` | `?category=&priority=&page=&limit=` | List tickets with optional filters |
| `GET` | `/api/tickets/:id` | — | Single ticket |

### Knowledge base

| Method | Path | Body | Description |
|---|---|---|---|
| `POST` | `/api/knowledge` | `{ title, content, source? }` | Add + embed document (raw text) |
| `POST` | `/api/knowledge/upload` | `multipart/form-data` — `file`, `source?` | Upload file and embed (docx, xlsx, pdf, txt, md) |
| `GET` | `/api/knowledge` | — | List documents |
| `DELETE` | `/api/knowledge/:id` | — | Remove document and its chunks |

### Chat (RAG)

| Method | Path | Body | Description |
|---|---|---|---|
| `POST` | `/api/sessions` | — | Create session |
| `POST` | `/api/chat` | `{ message, sessionId? }` | Send message, get grounded answer |
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
│   └── seed-knowledge.js          # Populate sample KB documents via API
├── docs/                          # Sample knowledge base files for upload
├── backend/                       # NestJS API (port 3001)
│   └── src/
│       ├── ollama/                # Ollama HTTP client (generate + embed)
│       ├── triage/                # Use Case 1 — structured generation
│       ├── knowledge/             # Document upload, chunking, embedding, cosine search
│       └── assistant/             # Use Case 2 — RAG chat
└── frontend/                      # Next.js 15 App Router (port 3000)
    └── src/
        ├── app/                   # Route pages (/, /triage, /assistant)
        ├── components/            # UI components
        ├── services/api.ts        # Axios API calls
        └── types/index.ts         # Shared TypeScript types
```

---

## Troubleshooting

**`LLM unavailable`** — run `ollama serve` and ensure both models are pulled (`ollama list`).

**Ollama 500 / `llama-server binary not found`** — you have the broken Homebrew build. Uninstall it (`brew uninstall ollama`) and use the official installer from [ollama.com/download](https://ollama.com/download).

**Slow first response** — Ollama loads the model on first call; subsequent responses are faster.

**Knowledge Assistant gives no results** — seed the knowledge base first: `node scripts/seed-knowledge.js`.

**Changed embedding model** — if you change `OLLAMA_EMBEDDING_MODEL`, you must re-add all documents (embeddings are dimension-specific).
