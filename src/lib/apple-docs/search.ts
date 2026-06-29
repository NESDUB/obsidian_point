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
  openJSON: string;
  openMarkdown: string;
};

export type SearchMode = "any" | "all";

export type SearchResponse = {
  query: string;
  framework?: string;
  mode: SearchMode;
  total: number;
  results: SearchResult[];
};

// ── URL helpers ────────────────────────────────────────────────────────────────

const SITE_BASE = process.env.NEXT_PUBLIC_SITE_URL
  || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "https://obsidianpoint.co");

function openUrls(path: string): { openJSON: string; openMarkdown: string } {
  return {
    openJSON: `${SITE_BASE}/r/apple-docs/poc/open/${path}?format=json`,
    openMarkdown: `${SITE_BASE}/r/apple-docs/poc/open/${path}?format=markdown`,
  };
}

// ── Index loading (filesystem) ─────────────────────────────────────────────────

import { readFile } from "fs/promises";
import { join } from "path";

function indexPath(file: string): string {
  return join(process.cwd(), "public", "apple-docs-index", file);
}

// In-memory cache — persists across requests within the same function instance
const cache = new Map<string, unknown>();

async function loadJson<T>(file: string): Promise<T | null> {
  const cached = cache.get(file);
  if (cached) return cached as T;

  try {
    const raw = await readFile(indexPath(file), "utf-8");
    const data = JSON.parse(raw) as T;
    cache.set(file, data);
    return data;
  } catch {
    return null;
  }
}

async function loadManifest(): Promise<Record<string, ManifestEntry> | null> {
  return loadJson("_manifest.json");
}

async function loadFrameworkIndex(framework: string): Promise<IndexEntry[] | null> {
  return loadJson(`${framework}.json`);
}

// ── Query intent detection ────────────────────────────────────────────────────

type QueryIntent = "symbol" | "howto" | "sample" | "broad";

const SAMPLE_WORDS = new Set(["sample", "demo", "example", "project", "tutorial"]);
const HOWTO_WORDS = new Set(["how", "guide", "using", "implement", "create", "build", "configure", "apply", "add", "set", "make", "use", "enable", "handle", "manage", "custom", "perform"]);

function detectIntent(queryLower: string, queryTokens: string[]): QueryIntent {
  // Contains sample-related words → sample intent
  if (queryTokens.some(t => SAMPLE_WORDS.has(t))) return "sample";

  // Contains how-to/implementation words → howto intent
  if (queryTokens.some(t => HOWTO_WORDS.has(t))) return "howto";

  // Looks like a CamelCase symbol name (has uppercase in original query, or single compound word)
  if (/[A-Z]/.test(queryLower.replace(/\b\w/g, "")) || (queryTokens.length <= 2 && /^[a-z]+$/.test(queryTokens.join("")))) {
    return "symbol";
  }

  // Multi-word natural language → broad
  if (queryTokens.length >= 3) return "broad";

  return "symbol";
}

const SYMBOL_ROLES = new Set([
  "Class", "Structure", "Enumeration", "Protocol", "Type Alias",
  "Function", "Macro", "Global Variable", "Type", "symbol",
]);
const ARTICLE_ROLES = new Set(["Article", "article", "collectionGroup", "pseudoSymbol"]);
const SAMPLE_ROLES = new Set(["Sample Code"]);
const OVERVIEW_ROLES = new Set(["Framework", "collection", "API Collection", "Technology"]);
const NESTED_ROLES = new Set([
  "Instance Property", "Instance Method", "Type Property", "Type Method",
  "Case", "Enumeration Case", "Initializer", "Operator",
  "Instance Subscript", "Instance Variable",
]);

function roleBoost(role: string, intent: QueryIntent): number {
  switch (intent) {
    case "symbol":
      if (SYMBOL_ROLES.has(role)) return 10;
      if (OVERVIEW_ROLES.has(role)) return 5;
      if (ARTICLE_ROLES.has(role)) return -5;
      if (NESTED_ROLES.has(role)) return -3;
      return 0;
    case "howto":
      if (ARTICLE_ROLES.has(role)) return 15;
      if (SAMPLE_ROLES.has(role)) return 10;
      if (OVERVIEW_ROLES.has(role)) return 8;
      if (NESTED_ROLES.has(role)) return -5;
      return 0;
    case "sample":
      if (SAMPLE_ROLES.has(role)) return 20;
      if (ARTICLE_ROLES.has(role)) return 5;
      if (NESTED_ROLES.has(role)) return -5;
      return 0;
    case "broad":
      if (OVERVIEW_ROLES.has(role)) return 12;
      if (ARTICLE_ROLES.has(role)) return 10;
      if (SAMPLE_ROLES.has(role)) return 5;
      if (NESTED_ROLES.has(role)) return -5;
      return 0;
  }
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

function scoreEntry(entry: IndexEntry, queryTokens: string[], queryLower: string, intent: QueryIntent): number {
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

  // Role-aware boost based on query intent
  if (score > 0) {
    score += roleBoost(entry.r, intent);
  }

  return score;
}

// ── Collapse: group nested symbols under parent ──────────────────────────────

function collapseResults(results: SearchResult[]): SearchResult[] {
  // Group by parent path: "documentation/Speech/SpeechAnalyzer/Options/ModelRetention"
  // → parent is "documentation/Speech/SpeechAnalyzer/Options"
  // Keep the highest-scoring entry per parent group, but always keep top-level symbols.
  const groups = new Map<string, SearchResult>();

  for (const r of results) {
    // Find the "parent group key" — collapse anything deeper than framework/Symbol
    const parts = r.path.split("/");
    // documentation/Framework/Symbol = 3 parts → top-level, use full path as key
    // documentation/Framework/Symbol/Child/... = 4+ parts → group under first 3
    const key = parts.length > 3 ? parts.slice(0, 3).join("/") : r.path;

    const existing = groups.get(key);
    if (!existing || r.score > existing.score) {
      groups.set(key, r);
    }
  }

  return [...groups.values()].sort((a, b) => b.score - a.score);
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

// ── Mode: all — every token must appear somewhere in the entry ─────────────────

function matchesAll(entry: IndexEntry, queryTokens: string[]): boolean {
  const haystack = `${entry.t} ${entry.p} ${entry.a || ""}`.toLowerCase();
  return queryTokens.every(qt => haystack.includes(qt));
}

// ── Core search against a list of entries ──────────────────────────────────────

function searchEntries(
  entries: IndexEntry[],
  fw: string,
  queryTokens: string[],
  queryLower: string,
  mode: SearchMode,
  intent: QueryIntent,
): SearchResult[] {
  const results: SearchResult[] = [];
  for (const entry of entries) {
    if (mode === "all" && !matchesAll(entry, queryTokens)) continue;
    const score = scoreEntry(entry, queryTokens, queryLower, intent);
    if (score > 0) {
      results.push({
        title: entry.t,
        framework: fw,
        path: entry.p,
        role: entry.r,
        abstract: entry.a,
        score,
        ...openUrls(entry.p),
      });
    }
  }
  return results;
}

// ── mode=any with multiple terms: split on comma/pipe, run each, merge ─────────

function splitTerms(query: string): string[] {
  return query.split(/[,|]/).map(t => t.trim()).filter(Boolean);
}

async function searchSingleQuery(
  query: string,
  framework: string | undefined,
  mode: SearchMode,
  limit: number,
): Promise<SearchResult[]> {
  const queryLower = query.toLowerCase().trim();
  const queryTokens = camelTokens(query);
  const intent = detectIntent(queryLower, queryTokens);

  if (framework) {
    const entries = await loadFrameworkIndex(framework);
    if (!entries) return [];
    return searchEntries(entries, framework, queryTokens, queryLower, mode, intent);
  }

  // Cross-framework search
  const manifest = await loadManifest();
  if (!manifest) return [];

  const matchedFrameworks = matchFrameworks(manifest, queryTokens, queryLower);
  const toSearch = new Set(matchedFrameworks.slice(0, 5));
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
      allResults.push(...searchEntries(entries, fw, queryTokens, queryLower, mode, intent));
    })
  );

  return allResults;
}

export async function search(
  query: string,
  framework?: string,
  limit = 20,
  mode: SearchMode = "any",
  collapse = false,
): Promise<SearchResponse> {
  const terms = splitTerms(query);

  // Multiple comma/pipe-separated terms in "any" mode → batch search each term independently
  if (mode === "any" && terms.length > 1) {
    const seen = new Set<string>();
    const merged: SearchResult[] = [];

    for (const term of terms) {
      const results = await searchSingleQuery(term, framework, "any", limit);
      for (const r of results) {
        if (!seen.has(r.path)) {
          seen.add(r.path);
          merged.push(r);
        }
      }
    }

    merged.sort((a, b) => b.score - a.score);
    const deduped = collapse ? collapseResults(merged) : merged;
    const results = deduped.slice(0, limit);
    return { query, framework, mode, total: results.length, results };
  }

  // Single query (or mode=all which treats the full query as one unit)
  const allResults = await searchSingleQuery(query, framework, mode, limit);
  allResults.sort((a, b) => b.score - a.score);
  const deduped = collapse ? collapseResults(allResults) : allResults;
  const results = deduped.slice(0, limit);
  return { query, framework, mode, total: results.length, results };
}
