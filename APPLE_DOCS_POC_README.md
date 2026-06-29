# Apple Docs Gateway — Architecture & API Reference

## What this is

A public Apple documentation research gateway hosted at `obsidianpoint.co`. It provides two capabilities:

1. **Search** — Fuzzy discovery across 344,851 pages from 391 Apple frameworks, powered by a pre-built metadata index
2. **Open** — Live translation of any Apple DocC page into AI-readable Markdown or JSON, fetched directly from Apple's servers

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        obsidianpoint.co                         │
│                                                                 │
│  /r/apple-docs/search?q=...                                    │
│       │                                                         │
│       ▼                                                         │
│  ┌──────────────────────┐                                       │
│  │  Per-framework JSON  │  344,851 entries across 391 files     │
│  │  index files (~55MB) │  Stored in public/apple-docs-index/   │
│  │  read from disk      │  Fields: title, path, role, abstract  │
│  └──────────────────────┘                                       │
│       │ ranked results with paths                               │
│       ▼                                                         │
│  /r/apple-docs/poc/open/documentation/Speech/SpeechAnalyzer     │
│       │                                                         │
│       ▼                                                         │
│  ┌──────────────────────┐     ┌──────────────────────────────┐  │
│  │  Live DocC fetcher   │────▶│  developer.apple.com         │  │
│  │  (docc.ts)           │◀────│  /tutorials/data/.../*.json  │  │
│  └──────────────────────┘     └──────────────────────────────┘  │
│       │ translated Markdown/JSON                                │
│       ▼                                                         │
│  Response: full doc content, always fresh from Apple            │
└─────────────────────────────────────────────────────────────────┘
```

**Key design decisions:**

- The search index contains **metadata only** (title, path, role, abstract) — not full doc bodies. This keeps it small (~55MB total) and fast to read from disk.
- Full page content is **always fetched live from Apple** at request time. This means docs are never stale — Apple is the source of truth.
- The index was generated offline from Apple's public DocC JSON endpoints (the same `developer.apple.com/tutorials/data/documentation/*.json` URLs that power Apple's own website). No private APIs.
- Index files are read directly from the filesystem (`fs/promises`), not via HTTP self-fetch. This avoids issues with serverless functions fetching their own assets.
- Results are cached in-memory within a function instance to avoid re-parsing JSON on every request.

---

## API Endpoints

### `GET /r/apple-docs/search`

Fuzzy search across the metadata index. Returns ranked results.

**Parameters:**

| Param | Required | Default | Description |
|-------|----------|---------|-------------|
| `q` | yes | — | Search query (e.g., `SpeechAnalyzer`, `liquid glass`, `guided generation`) |
| `framework` | no | — | Scope search to one framework (e.g., `Speech`, `SwiftUI`, `FoundationModels`) |
| `limit` | no | `20` | Max results (1–100) |

**Scoring algorithm:**

Results are ranked by a composite score:
1. Exact title match → 100 pts
2. Title starts with query → 80 pts
3. Title contains query → 60 pts
4. Path contains query → 20 pts
5. CamelCase token matching (splits `SpeechAnalyzer` → `speech`, `analyzer`) → 10–15 pts per token
6. All query tokens match title → 25 pt bonus
7. Abstract keyword match → 5 pts per token
8. Shorter titles (more specific symbols) → 2 pt bonus
9. Collection/framework overview pages → 5 pt boost

**Cross-framework search:** When `framework` is omitted, the endpoint first matches query tokens against framework names to find the most relevant frameworks, then searches the top 5 matching frameworks. If fewer than 3 framework names match, popular defaults (SwiftUI, Foundation, UIKit, AppKit, Swift) are included.

**Example requests:**

```
# Framework-scoped search
https://obsidianpoint.co/r/apple-docs/search?q=SpeechAnalyzer&framework=Speech

# Cross-framework search
https://obsidianpoint.co/r/apple-docs/search?q=liquid+glass&limit=10

# Multi-word concept search
https://obsidianpoint.co/r/apple-docs/search?q=foundation+models+guided+generation
```

**Example response:**

```json
{
  "query": "SpeechAnalyzer",
  "framework": "Speech",
  "total": 3,
  "results": [
    {
      "title": "SpeechAnalyzer",
      "framework": "Speech",
      "path": "documentation/Speech/SpeechAnalyzer",
      "role": "Class",
      "abstract": "Analyzes spoken audio content in various ways and manages the analysis session.",
      "score": 177
    }
  ]
}
```

---

### `GET /r/apple-docs/poc/open/[...path]`

Fetch a single Apple doc page live from Apple and return it as Markdown or JSON.

**Path-based (preferred for AI tools):**
```
/r/apple-docs/poc/open/documentation/Speech/SpeechAnalyzer?format=markdown
/r/apple-docs/poc/open/documentation/Speech/SpeechAnalyzer?format=json
```

**Query-param based (also supported):**
```
/r/apple-docs/poc/open?path=documentation/Speech/SpeechAnalyzer&format=json
```

**Parameters:**

| Param | Required | Default | Description |
|-------|----------|---------|-------------|
| `format` | no | `markdown` | Response format: `markdown` or `json` |

The `path` value comes from search results — use the `path` field directly.

**Markdown responses** use `Content-Type: text/plain; charset=utf-8` (not `text/markdown`) for maximum compatibility with AI web fetch tools.

**JSON response includes:**
```
title, framework, role, normalizedPath, officialURL, doccDataURL,
abstract, availability, markdown (rendered body), headings,
codeBlocks, related links
```

---

### Other utility endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /r/apple-docs/poc` | Landing page (HTML) |
| `GET /r/apple-docs/poc/health` | Health check |
| `GET /r/apple-docs/poc/llms.txt` | Machine-readable API description |

---

## Recommended AI workflow

```
Step 1: Search for what you need
  GET /r/apple-docs/search?q=speech+transcription+live+audio

Step 2: Pick the best result's path from the response

Step 3: Fetch the full doc
  GET /r/apple-docs/poc/open/documentation/Speech/SpeechAnalyzer?format=json

Step 4: Read the markdown field for the full translated documentation
```

---

## Index coverage

- **391 frameworks** indexed (every framework Apple publishes via DocC)
- **344,851 pages** total (symbols, articles, sample code, collection groups)
- Index generated from Apple's public DocC JSON endpoints
- Index is static — does not auto-update. Re-generation requires running the offline export script against the SQLite database.
- Full doc content via `/open` is always live from Apple and never stale.

---

## Files

```
src/lib/apple-docs/docc.ts                              # Live DocC fetcher + translator
src/lib/apple-docs/search.ts                            # Search index loader + scoring
src/app/(public)/r/apple-docs/search/route.ts           # /search endpoint
src/app/(public)/r/apple-docs/poc/open/handler.ts       # Shared open handler
src/app/(public)/r/apple-docs/poc/open/route.ts         # /open (query param)
src/app/(public)/r/apple-docs/poc/open/[...path]/route.ts  # /open/[...path] (path-based)
src/app/(public)/r/apple-docs/poc/page.tsx              # Landing page
src/app/(public)/r/apple-docs/poc/health/route.ts       # Health check
src/app/(public)/r/apple-docs/poc/llms.txt/route.ts     # Machine-readable description
public/apple-docs-index/_manifest.json                  # Framework list with page counts
public/apple-docs-index/{Framework}.json                # Per-framework search index
middleware.ts                                           # Bypasses /r/* from auth
```
