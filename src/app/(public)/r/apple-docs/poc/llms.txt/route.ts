export const runtime = "nodejs";

export async function GET() {
  const body = `# Obsidian Point — Apple Docs Gateway v1

A research gateway for Apple Developer Documentation. Searches 344,851 pages across 391 frameworks, then fetches full doc content live from Apple's servers. Always fresh, never stale.

## AI workflow (recommended order)

1. /brief    — Research a topic. Searches the index, live-fetches top results from Apple, returns everything in one response.
2. /search   — Discover doc paths. Returns ranked results with direct open URLs.
3. /open     — Expand a single document. Use when you need the full page for a known path.
4. /related  — Get related links for a known document path. Useful for exploring related articles, samples, or symbols.

## Endpoints

### GET /r/apple-docs/brief
Research endpoint. Searches + live-fetches top results in one call.

Parameters:
  q              (required) Search query. Examples: "SpeechAnalyzer", "liquid glass", "guided generation"
  framework      (optional) Scope to one framework. Examples: "Speech", "SwiftUI", "FoundationModels"
  open           (optional) Number of top results to live-fetch (1–5, default 3)
  limit          (optional) Total search results to return (1–20, default 8)
  collapse       (optional) "parent" (default) collapses nested symbols under their parent. Set to "none" to disable.
  followRelated  (optional) After opening top results, also live-fetch their related docs. Values: "articles", "samples", "symbols", "all"

Example:
  /r/apple-docs/brief?q=SpeechAnalyzer&framework=Speech&open=3&followRelated=articles

Returns: ranked search results + full markdown, headings, code blocks, related links, and availability for the top opened pages. Each opened page includes a "source" field ("search" or "related").
Response includes "detectedIntent" (symbol/howto/sample/broad) and "collapsed" (boolean) for transparency.

### GET /r/apple-docs/search
Path discovery endpoint. Fast metadata-only search.

Parameters:
  q         (required) Search query. Use commas or pipes to separate multiple terms in mode=any.
  framework (optional) Scope to one framework
  limit     (optional) Max results (1–100, default 20)
  mode      (optional) Search mode: "any" (default) or "all"
              mode=any: Comma/pipe-separated terms searched independently, results merged. Use for batch lookup.
              mode=all: Every token must appear in the entry's title, path, or abstract. Use for conjunctive queries.
  collapse  (optional) "parent" (default) collapses nested symbols. Set to "none" to disable.
  debug     (optional) Set to "score" to include scoreBreakdown for each result.

Examples:
  /r/apple-docs/search?q=SpeechAnalyzer&framework=Speech
  /r/apple-docs/search?q=SpeechAnalyzer,SpeechTranscriber,DictationTranscriber&framework=Speech&mode=any
  /r/apple-docs/search?q=speech+live+audio&framework=Speech&mode=all
  /r/apple-docs/search?q=GlassEffect&collapse=none
  /r/apple-docs/search?q=SpeechAnalyzer&framework=Speech&debug=score

Returns: ranked results with title, framework, path, role, abstract, score, openJSON, openMarkdown URLs.
Response includes "detectedIntent" (symbol/howto/sample/broad) and "collapsed" (boolean).
Results may also include: availability (platform versions like {"iOS": "26.0", "macOS": "26.0"}), deprecated (boolean), beta (boolean).
With collapse enabled, results include "collapseGroup" and "collapsedChildren" count.
With debug=score, results include "scoreBreakdown" with individual scoring components.

### GET /r/apple-docs/poc/open/{path}
Full document expansion. Fetches one page live from Apple.

Path-based (preferred):
  /r/apple-docs/poc/open/documentation/Speech/SpeechAnalyzer?format=json
  /r/apple-docs/poc/open/documentation/SwiftUI/GlassEffectContainer?format=markdown

Query-param (also supported):
  /r/apple-docs/poc/open?path=documentation/Speech/SpeechAnalyzer&format=json

Parameters:
  format (optional) "json" or "markdown" (default: markdown)

### GET /r/apple-docs/related
Related links for a known document path.

Parameters:
  path (required) Documentation path. Example: "documentation/Speech/SpeechAnalyzer"
  kind (optional) Filter by link kind: "article", "symbol", "samplecode"

Example:
  /r/apple-docs/related?path=documentation/Speech/SpeechAnalyzer&kind=article

Returns: title, framework, related links (each with title, path, kind, abstract).

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
