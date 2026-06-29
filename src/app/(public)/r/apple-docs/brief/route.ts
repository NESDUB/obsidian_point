import { NextRequest, NextResponse } from "next/server";
import { search } from "@/lib/apple-docs/search";
import { fetchLiveAppleDocBrief, briefToMarkdown, AppleDocCError, type AppleDocRelatedLink } from "@/lib/apple-docs/docc";

export const runtime = "nodejs";

const commonHeaders = {
  "Access-Control-Allow-Origin": "*",
  "X-Robots-Tag": "noindex, nofollow",
  "Cache-Control": "s-maxage=300, stale-while-revalidate=3600",
};

const SITE_BASE = process.env.NEXT_PUBLIC_SITE_URL
  || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "https://obsidianpoint.co");

type OpenedPage = {
  path: string;
  title: string;
  framework?: string;
  role?: string;
  officialURL?: string;
  abstract?: string;
  availability?: unknown[];
  headings?: string[];
  codeBlocks?: unknown[];
  related?: AppleDocRelatedLink[];
  markdown?: string;
  openJSON?: string;
  openMarkdown?: string;
  error?: string;
  source?: "search" | "related";
};

async function openPage(path: string, source: "search" | "related"): Promise<OpenedPage> {
  try {
    const brief = await fetchLiveAppleDocBrief(path);
    return {
      path,
      title: brief.title,
      framework: brief.framework,
      role: brief.role,
      officialURL: brief.officialURL,
      abstract: brief.abstract,
      availability: brief.availability,
      headings: brief.headings,
      codeBlocks: brief.codeBlocks,
      related: brief.related,
      markdown: briefToMarkdown(brief),
      openJSON: `${SITE_BASE}/r/apple-docs/poc/open/${path}?format=json`,
      openMarkdown: `${SITE_BASE}/r/apple-docs/poc/open/${path}?format=markdown`,
      source,
    };
  } catch (error) {
    return {
      path,
      title: path.split("/").pop() ?? path,
      error: error instanceof AppleDocCError ? error.message : "Failed to fetch",
      source,
    };
  }
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const query = params.get("q")?.trim() ?? "";
  const framework = params.get("framework")?.trim() || undefined;
  const openCount = Math.min(Math.max(parseInt(params.get("open") ?? "3", 10) || 3, 1), 5);
  const resultCount = Math.min(Math.max(parseInt(params.get("limit") ?? "8", 10) || 8, 1), 20);
  const collapseParam = params.get("collapse")?.trim().toLowerCase();
  const collapse = collapseParam === "none" ? false : true;
  const followRelated = params.get("followRelated")?.trim().toLowerCase() || undefined;

  if (!query) {
    return NextResponse.json(
      {
        error: "Missing required parameter: q",
        usage: "/r/apple-docs/brief?q=SpeechAnalyzer&framework=Speech&open=3&limit=8&collapse=none&followRelated=articles",
      },
      { status: 400, headers: commonHeaders },
    );
  }

  // Step 1: Search
  const searchResults = await search(query, framework, resultCount, "any", collapse);

  // Step 2: Live-fetch top results from Apple
  const toOpen = searchResults.results.slice(0, openCount);
  const opened: OpenedPage[] = await Promise.all(
    toOpen.map((result) => openPage(result.path, "search"))
  );

  // Step 3: If followRelated is set, collect related links from opened pages,
  // filter by kind, and live-fetch those too (deduplicating against already-opened paths)
  if (followRelated && opened.length > 0) {
    const openedPaths = new Set(opened.map((o) => o.path.toLowerCase()));
    const relatedToFollow: { path: string; kind: string }[] = [];

    for (const page of opened) {
      if (page.error || !page.related) continue;
      for (const rel of page.related) {
        if (!rel.path) continue;
        const pathLower = rel.path.toLowerCase();
        if (openedPaths.has(pathLower)) continue;

        const kindLower = (rel.kind ?? "").toLowerCase();
        const match =
          followRelated === "articles" ? kindLower === "article" :
          followRelated === "samples" ? kindLower === "samplecode" || kindLower === "sample code" :
          followRelated === "symbols" ? kindLower === "symbol" :
          true; // followRelated=all

        if (match) {
          openedPaths.add(pathLower);
          relatedToFollow.push({ path: rel.path, kind: rel.kind ?? "" });
        }
      }
    }

    // Limit related follows to avoid excessive fetches
    const maxRelated = Math.min(relatedToFollow.length, 3);
    const relatedPages = await Promise.all(
      relatedToFollow.slice(0, maxRelated).map((r) => openPage(r.path, "related"))
    );
    opened.push(...relatedPages);
  }

  return NextResponse.json(
    {
      query,
      framework,
      detectedIntent: searchResults.detectedIntent,
      collapsed: searchResults.collapsed,
      searchTotal: searchResults.total,
      openedCount: opened.filter((o) => !o.error).length,
      followRelated: followRelated ?? null,
      results: searchResults.results,
      opened,
    },
    { headers: commonHeaders },
  );
}
