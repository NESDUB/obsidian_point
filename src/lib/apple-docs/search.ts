/**
 * Apple Docs search index — reads per-framework JSON files from /public/apple-docs-index/
 * generated offline from Apple's DocC data. Full page content is still fetched live from Apple.
 */

// ── Types ──────────────────────────────────────────────────────────────────────

/** Compact index entry as stored in per-framework JSON files: {t, p, r, a?} */
type IndexEntry = { t: string; p: string; r: string; a?: string };

/** Manifest entry per framework */
type ManifestEntry = { count: number; size: number };

export type SearchResult = {
  title: string;
  framework: string;
  path: string;
  role: string;
  abstract?: string;
  score: number;
};

export type SearchResponse = {
  query: string;
  framework?: string;
  total: number;
  results: SearchResult[];
};

// ── Index loading ──────────────────────────────────────────────────────────────

const BASE = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

function indexUrl(file: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL
    || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  return `${base}/apple-docs-index/${encodeURIComponent(file)}`;
}

// Simple in-memory cache to avoid re-fetching within the same function instance
const cache = new Map<string, { data: unknown; ts: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function fetchJson<T>(url: string): Promise<T | null> {
  const now = Date.now();
  const cached = cache.get(url);
  if (cached && now - cached.ts < CACHE_TTL) return cached.data as T;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json() as T;
    cache.set(url, { data, ts: now });
    return data;
  } catch {
    return null;
  }
}

async function loadManifest(): Promise<Record<string, ManifestEntry> | null> {
  return fetchJson(indexUrl("_manifest.json"));
}

async function loadFrameworkIndex(framework: string): Promise<IndexEntry[] | null> {
  return fetchJson(indexUrl(`${framework}.json`));
}

// ── Scoring ────────────────────────────────────────────────────────────────────

/** Split "SpeechAnalyzer" → ["speech", "analyzer"] */
function camelTokens(s: string): string[] {
  return s
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .toLowerCase()
    .split(/[\s_\-./]+/)
    .filter(Boolean);
}

function scoreEntry(entry: IndexEntry, queryTokens: string[], queryLower: string): number {
  const titleLower = entry.t.toLowerCase();
  const pathLower = entry.p.toLowerCase();
  const abstractLower = (entry.a || "").toLowerCase();
  const titleTokens = camelTokens(entry.t);

  let score = 0;

  // Exact title match
  if (titleLower === queryLower) {
    score += 100;
  }
  // Title starts with query
  else if (titleLower.startsWith(queryLower)) {
    score += 80;
  }
  // Title contains query as substring
  else if (titleLower.includes(queryLower)) {
    score += 60;
  }

  // Path contains query
  if (pathLower.includes(queryLower)) {
    score += 20;
  }

  // Token matching — each query token matched in title tokens
  let titleTokenMatches = 0;
  for (const qt of queryTokens) {
    if (titleTokens.some(tt => tt === qt)) {
      titleTokenMatches++;
      score += 15;
    } else if (titleTokens.some(tt => tt.startsWith(qt))) {
      titleTokenMatches++;
      score += 10;
    }
  }

  // Bonus for matching all query tokens in title
  if (queryTokens.length > 1 && titleTokenMatches === queryTokens.length) {
    score += 25;
  }

  // Abstract keyword matches
  for (const qt of queryTokens) {
    if (abstractLower.includes(qt)) {
      score += 5;
    }
  }

  // Slight boost for shorter titles (more specific symbols rank higher)
  if (score > 0 && entry.t.length < 40) {
    score += 2;
  }

  // Boost collection/framework roles (overview pages are useful)
  if (score > 0 && (entry.r === "collection" || entry.r === "Framework")) {
    score += 5;
  }

  return score;
}

// ── Search ─────────────────────────────────────────────────────────────────────

/** Find the best matching framework name from the manifest */
function matchFrameworks(
  manifest: Record<string, ManifestEntry>,
  queryTokens: string[],
  queryLower: string,
): string[] {
  const scored: { name: string; score: number }[] = [];

  for (const name of Object.keys(manifest)) {
    const nameLower = name.toLowerCase();
    const nameTokens = camelTokens(name);
    let score = 0;

    if (nameLower === queryLower) {
      score += 100;
    } else if (nameLower.includes(queryLower)) {
      score += 50;
    }

    for (const qt of queryTokens) {
      if (nameTokens.some(nt => nt === qt)) score += 20;
      else if (nameLower.includes(qt)) score += 10;
    }

    if (score > 0) scored.push({ name, score });
  }

  return scored.sort((a, b) => b.score - a.score).map(s => s.name);
}

export async function search(
  query: string,
  framework?: string,
  limit = 20,
): Promise<SearchResponse> {
  const queryLower = query.toLowerCase().trim();
  const queryTokens = camelTokens(query);

  if (framework) {
    // Search a single framework
    const entries = await loadFrameworkIndex(framework);
    if (!entries) {
      return { query, framework, total: 0, results: [] };
    }

    const scored = entries
      .map(e => ({ entry: e, score: scoreEntry(e, queryTokens, queryLower) }))
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return {
      query,
      framework,
      total: scored.length,
      results: scored.map(s => ({
        title: s.entry.t,
        framework,
        path: s.entry.p,
        role: s.entry.r,
        abstract: s.entry.a,
        score: s.score,
      })),
    };
  }

  // Cross-framework search: find matching frameworks, then search top ones
  const manifest = await loadManifest();
  if (!manifest) {
    return { query, total: 0, results: [] };
  }

  // Find frameworks whose names match the query
  const matchedFrameworks = matchFrameworks(manifest, queryTokens, queryLower);

  // Always search the top matched frameworks, plus a few large popular ones as fallbacks
  const toSearch = new Set(matchedFrameworks.slice(0, 5));
  // If few framework matches, add some popular defaults
  if (toSearch.size < 3) {
    for (const fw of ["SwiftUI", "Foundation", "UIKit", "AppKit", "Swift"]) {
      if (manifest[fw]) toSearch.add(fw);
      if (toSearch.size >= 5) break;
    }
  }

  const allResults: SearchResult[] = [];

  await Promise.all(
    [...toSearch].map(async (fw) => {
      const entries = await loadFrameworkIndex(fw);
      if (!entries) return;

      for (const entry of entries) {
        const score = scoreEntry(entry, queryTokens, queryLower);
        if (score > 0) {
          allResults.push({
            title: entry.t,
            framework: fw,
            path: entry.p,
            role: entry.r,
            abstract: entry.a,
            score,
          });
        }
      }
    })
  );

  allResults.sort((a, b) => b.score - a.score);
  const results = allResults.slice(0, limit);

  return {
    query,
    total: results.length,
    results,
  };
}
