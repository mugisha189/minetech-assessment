# Decision Memo

## Model choice

**Generation: `llama3.2` (3B) via Ollama**

Llama 3.2 3B was chosen over larger alternatives for three reasons. First, it fits
in CPU RAM (~2 GB loaded) and runs on any modern laptop with no GPU — satisfying
the "free resources" constraint. Second, Ollama ships it pre-quantised at Q4_K_M,
cutting memory roughly in half relative to FP16 with only a marginal quality drop.
Third, Meta's instruction-tuning on this generation produces reliable structured
output when the prompt is explicit about the expected JSON shape, which is critical
for Use Case 1.

Alternatives considered: Phi-3 Mini (similar size, slightly weaker at following
JSON schemas) and Qwen2.5 3B (strong but a larger download). Llama 3.2 offered
the best balance of quality, size, and community support.

**Embeddings: `nomic-embed-text` via Ollama**

nomic-embed-text produces 768-dimensional embeddings and ranks among the top
open-source embedding models on the MTEB benchmark for its size class. It runs
quickly on CPU and its 768-dim output is standard for semantic similarity tasks.

---

## Quantisation and serving approach

Ollama handles quantisation transparently. `llama3.2` is served at Q4_K_M by
default — a 4-bit mixed-precision format that keeps important weight layers at
higher precision. The backend calls Ollama's HTTP API (`/api/generate`,
`/api/embeddings`) with `stream: false`. Latency on CPU (M-series Mac or modern
laptop) is 5–15 seconds per generation request for the 3B model — acceptable for
a demo. Production throughput would require GPU inference or response streaming,
both achievable by changing only the Ollama configuration.

---

## Use Case 1 — Triage schema (the ambiguous point)

The spec did not define what fields a triaged ticket should contain. I chose:

| Field | Rationale |
|---|---|
| `category` (7 values) | Covers the realistic support surface: technical, billing, features, bugs, account, general, complaints. Kept to 7 to avoid ambiguity. |
| `priority` (critical/high/medium/low) | Standard 4-tier priority used by most ITSM tools. `critical` is intentionally rare — defined as data loss or complete outage. |
| `sentiment` | Useful routing signal: negative sentiment + high priority = escalation candidate. |
| `summary` | One-sentence TL;DR for the dashboard list view. |
| `urgency_signals` | Extracted phrases ("board meeting at 2pm", "been down for 3 hours") that justify the priority — gives agents transparency into the model's reasoning. |
| `suggested_reply` | Draft reply so agents can respond faster; explicitly framed as a draft, not auto-sent. |
| `confidence` | Float 0–1. Low-confidence tickets (< 0.5) are visually flagged in the dashboard. |

**Graceful degradation:** The parser tries three strategies in order — direct
`JSON.parse`, regex extraction of the first `{...}` block, and markdown fence
stripping. If all three fail, the ticket is saved with a `parse_error` field
containing the raw output and safe fallback values for all classification fields.
No ticket is silently lost.

---

## Use Case 2 — "Not in knowledge base" definition (the ambiguous point)

**Decision: cosine similarity < 0.50 → "not in knowledge base"**

Reasoning: `nomic-embed-text` cosine similarity is typically 0.85–0.99 for
semantically identical text, 0.55–0.75 for related but different topics, and
0.15–0.45 for unrelated content. A threshold of 0.50 sits clearly in the gap
between the last two distributions, minimising both false ignorance (claiming we
don't know when the answer is there) and hallucination risk (fabricating an answer
when it is not).

When the best-matching chunk scores below 0.50, the model receives a completely
different prompt: it is told the knowledge base has no relevant information and
instructed to politely decline. This prevents hallucination structurally rather
than by hoping the model self-censors.

The threshold is a single constant (`SIMILARITY_THRESHOLD = 0.50` in
`assistant.service.ts`) for easy tuning from real usage data.

---

## Retrieval strategy

Documents are split into 500-character chunks with a 60-character overlap.
The overlap preserves sentences cut at chunk boundaries, improving recall for
questions about content near a boundary.

Chunks are embedded at write time and stored in memory. At query time:
1. The question is embedded with the same model.
2. Cosine similarity is computed in TypeScript against all stored chunks.
3. Top-5 chunks are selected.
4. Chunks above the 0.50 threshold are formatted as a numbered context block.
5. The model is instructed to cite using `[Source N]` notation; citations are
   also returned as structured metadata to the frontend.

An in-memory linear scan is fast enough for a small knowledge base (< 5,000
chunks). For production scale, a vector store (pgvector, Qdrant, or Chroma) would
be the right next step — the retrieval interface in `KnowledgeService` is designed
to be swapped out without touching the assistant logic.

---

## Hallucination handling

**Use Case 1:** Structured output is validated through a three-stage parser. The
`confidence` field gives agents a trust signal; the `parse_error` field surfaces
raw output for audit. No ticket is accepted as "correctly triaged" without at
least passing the coercion step.

**Use Case 2:** The RAG system grounds answers structurally. When similarity < 0.50
the model receives no document context at all — only an instruction to decline.
When context is provided, the prompt explicitly forbids using outside knowledge.
Citations are extracted at the retrieval layer, not inferred from generated text,
so they are always accurate to the actual documents.

---

## Latency vs. hardware trade-offs

| Scenario | Approx. latency |
|---|---|
| Triage, 3B, CPU only | 5–15 s |
| RAG (embed + retrieve + generate), CPU | 8–20 s |
| Embedding only | < 1 s |
| Either, with GPU (e.g. RTX 3060) | 1–3 s |

For production: GPU inference, streaming tokens to the browser, and caching
popular embeddings would close the latency gap without any architecture change.
