export const runtime = "nodejs";

export async function GET() {
  const body = `# Obsidian Point — Apple Docs Gateway v1

A research gateway for Apple Developer Documentation. Searches 344,851 pages across 391 frameworks, then fetches full doc content live from Apple's servers. Always fresh, never stale.

## AI workflow (recommended order)

1. /brief  — Research a topic. Searches the index, live-fetches top results from Apple, returns everything in one response.
2. /search — Discover doc paths. Returns ranked results with direct open URLs.
3. /open   — Expand a single document. Use when you need the full page for a known path.

## Endpoints

### GET /r/apple-docs/brief
Research endpoint. Searches + live-fetches top results in one call.

Parameters:
  q         (required) Search query. Examples: "SpeechAnalyzer", "liquid glass", "guided generation"
  framework (optional) Scope to one framework. Examples: "Speech", "SwiftUI", "FoundationModels"
  open      (optional) Number of top results to live-fetch (1–5, default 3)
  limit     (optional) Total search results to return (1–20, default 8)

Example:
  /r/apple-docs/brief?q=SpeechAnalyzer&framework=Speech&open=3

Returns: ranked search results + full markdown, headings, code blocks, related links, and availability for the top opened pages.

### GET /r/apple-docs/search
Path discovery endpoint. Fast metadata-only search.

Parameters:
  q         (required) Search query
  framework (optional) Scope to one framework
  limit     (optional) Max results (1–100, default 20)

Example:
  /r/apple-docs/search?q=liquid+glass&limit=10

Returns: ranked results with title, framework, path, role, abstract, score, openJSON, openMarkdown URLs.

### GET /r/apple-docs/poc/open/{path}
Full document expansion. Fetches one page live from Apple.

Path-based (preferred):
  /r/apple-docs/poc/open/documentation/Speech/SpeechAnalyzer?format=json
  /r/apple-docs/poc/open/documentation/SwiftUI/GlassEffectContainer?format=markdown

Query-param (also supported):
  /r/apple-docs/poc/open?path=documentation/Speech/SpeechAnalyzer&format=json

Parameters:
  format (optional) "json" or "markdown" (default: markdown)

### GET /r/apple-docs/poc/health
Health check. Returns {"ok": true}.

## Notes

- All endpoints return Access-Control-Allow-Origin: * (CORS open).
- Markdown responses use Content-Type: text/plain for AI tool compatibility.
- Search results include openJSON and openMarkdown URLs for direct chaining.
- The search index is pre-built metadata (title, path, role, abstract). Full content is always live from Apple.
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "X-Robots-Tag": "noindex, nofollow",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
