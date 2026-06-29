import { NextRequest, NextResponse } from "next/server";
import { AppleDocCError, fetchLiveAppleDocBrief } from "@/lib/apple-docs/docc";

export const runtime = "nodejs";

const commonHeaders = {
  "Access-Control-Allow-Origin": "*",
  "X-Robots-Tag": "noindex, nofollow",
  "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400",
};

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const path = params.get("path")?.trim() ?? "";
  const kindFilter = params.get("kind")?.trim().toLowerCase() || undefined;

  if (!path) {
    return NextResponse.json(
      {
        error: "Missing required parameter: path",
        usage: "/r/apple-docs/related?path=documentation/Speech/SpeechAnalyzer&kind=article",
      },
      { status: 400, headers: commonHeaders },
    );
  }

  try {
    const brief = await fetchLiveAppleDocBrief(path);
    let related = brief.related;

    if (kindFilter) {
      related = related.filter((r) => r.kind?.toLowerCase() === kindFilter);
    }

    return NextResponse.json(
      {
        path: brief.normalizedPath,
        title: brief.title,
        framework: brief.framework,
        kind: kindFilter ?? "all",
        total: related.length,
        related,
      },
      { headers: commonHeaders },
    );
  } catch (error) {
    const status = error instanceof AppleDocCError ? error.status ?? 400 : 500;
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        detail: error instanceof AppleDocCError ? error.detail : undefined,
      },
      { status, headers: commonHeaders },
    );
  }
}
