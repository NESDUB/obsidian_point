import { NextRequest, NextResponse } from "next/server";
import { search, type SearchMode } from "@/lib/apple-docs/search";

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
  const limit = Math.min(Math.max(parseInt(params.get("limit") ?? "20", 10) || 20, 1), 100);
  const modeParam = params.get("mode")?.trim().toLowerCase();
  const mode: SearchMode = modeParam === "all" ? "all" : "any";
  // collapse defaults to true; pass collapse=none to disable
  const collapseParam = params.get("collapse")?.trim().toLowerCase();
  const collapse = collapseParam === "none" ? false : true;
  const debug = params.get("debug") === "score";

  if (!query) {
    return NextResponse.json(
      {
        error: "Missing required parameter: q",
        usage: "/r/apple-docs/search?q=SpeechAnalyzer&framework=Speech&limit=20&mode=any&collapse=none&debug=score",
      },
      { status: 400, headers: commonHeaders },
    );
  }

  const results = await search(query, framework, limit, mode, collapse, debug);
  return NextResponse.json(results, { headers: commonHeaders });
}
