import { NextRequest, NextResponse } from "next/server";
import { search } from "@/lib/apple-docs/search";
import { fetchLiveAppleDocBrief, briefToMarkdown, AppleDocCError } from "@/lib/apple-docs/docc";

export const runtime = "nodejs";

const commonHeaders = {
  "Access-Control-Allow-Origin": "*",
  "X-Robots-Tag": "noindex, nofollow",
  "Cache-Control": "s-maxage=300, stale-while-revalidate=3600",
};

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const query = params.get("q")?.trim() ?? "";
  const framework = params.get("framework")?.trim() || undefined;
  const openCount = Math.min(Math.max(parseInt(params.get("open") ?? "3", 10) || 3, 1), 5);
  const resultCount = Math.min(Math.max(parseInt(params.get("limit") ?? "8", 10) || 8, 1), 20);
  const collapse = params.get("collapse") === "parent";

  if (!query) {
    return NextResponse.json(
      {
        error: "Missing required parameter: q",
        usage: "/r/apple-docs/brief?q=SpeechAnalyzer&framework=Speech&open=3&limit=8&collapse=parent",
      },
      { status: 400, headers: commonHeaders },
    );
  }

  // Step 1: Search (collapse nested symbols when requested)
  const searchResults = await search(query, framework, resultCount, "any", collapse);

  // Step 2: Live-fetch top results from Apple
  const toOpen = searchResults.results.slice(0, openCount);

  const opened = await Promise.all(
    toOpen.map(async (result) => {
      try {
        const brief = await fetchLiveAppleDocBrief(result.path);
        return {
          path: result.path,
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
          openJSON: result.openJSON,
          openMarkdown: result.openMarkdown,
        };
      } catch (error) {
        return {
          path: result.path,
          title: result.title,
          framework: result.framework,
          error: error instanceof AppleDocCError ? error.message : "Failed to fetch",
          openJSON: result.openJSON,
          openMarkdown: result.openMarkdown,
        };
      }
    })
  );

  return NextResponse.json(
    {
      query,
      framework,
      searchTotal: searchResults.total,
      openedCount: opened.filter((o) => !("error" in o)).length,
      results: searchResults.results,
      opened,
    },
    { headers: commonHeaders },
  );
}
