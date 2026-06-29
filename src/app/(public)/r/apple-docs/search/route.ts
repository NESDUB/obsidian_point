import { NextRequest, NextResponse } from "next/server";
import { search } from "@/lib/apple-docs/search";

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

  if (!query) {
    return NextResponse.json(
      {
        error: "Missing required parameter: q",
        usage: "/r/apple-docs/search?q=SpeechAnalyzer&framework=Speech&limit=20",
      },
      { status: 400, headers: commonHeaders },
    );
  }

  const results = await search(query, framework, limit);
  return NextResponse.json(results, { headers: commonHeaders });
}
