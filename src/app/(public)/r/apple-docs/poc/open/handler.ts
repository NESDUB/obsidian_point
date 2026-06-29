import { NextRequest, NextResponse } from "next/server";
import { AppleDocCError, briefToMarkdown, fetchLiveAppleDocBrief } from "@/lib/apple-docs/docc";

const commonHeaders = {
  "Access-Control-Allow-Origin": "*",
  "X-Robots-Tag": "noindex, nofollow",
  "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400",
};

export async function handleOpenRequest(request: NextRequest, input: string) {
  const format = (request.nextUrl.searchParams.get("format") ?? preferredFormat(request)).toLowerCase();

  try {
    const brief = await fetchLiveAppleDocBrief(input);

    if (format === "json") {
      return NextResponse.json(brief, { headers: commonHeaders });
    }

    return new NextResponse(briefToMarkdown(brief), {
      status: 200,
      headers: {
        ...commonHeaders,
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  } catch (error) {
    const status = error instanceof AppleDocCError ? error.status ?? 400 : 500;
    const payload = {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown error",
      detail: error instanceof AppleDocCError ? error.detail : undefined,
      hint: "Try a path like documentation/Speech/SpeechAnalyzer or a developer.apple.com documentation URL.",
    };

    if (format === "json") {
      return NextResponse.json(payload, { status, headers: commonHeaders });
    }

    return new NextResponse(`# Apple Docs POC error\n\n${payload.error}\n\n${payload.detail ? `\`\`\`text\n${payload.detail}\n\`\`\`\n\n` : ""}${payload.hint}\n`, {
      status,
      headers: {
        ...commonHeaders,
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  }
}

function preferredFormat(request: NextRequest): "json" | "markdown" {
  const accept = request.headers.get("accept") ?? "";
  return accept.includes("application/json") ? "json" : "markdown";
}
