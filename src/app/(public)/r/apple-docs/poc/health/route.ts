import { NextResponse } from "next/server";
import { buildAppleDocCDataURL, buildOfficialURL, normalizeAppleDocPath } from "@/lib/apple-docs/docc";

export const runtime = "nodejs";

export async function GET() {
  const samplePath = normalizeAppleDocPath("documentation/Speech/SpeechAnalyzer");

  return NextResponse.json(
    {
      ok: true,
      service: "apple-docs-live-docc-poc",
      purpose: "Fetch live Apple DocC JSON and translate it into AI-readable Markdown/JSON.",
      sample: {
        path: samplePath,
        officialURL: buildOfficialURL(samplePath),
        doccDataURL: buildAppleDocCDataURL(samplePath),
        markdownEndpoint: `/r/apple-docs/poc/open?format=markdown&path=${encodeURIComponent(samplePath)}`,
        jsonEndpoint: `/r/apple-docs/poc/open?format=json&path=${encodeURIComponent(samplePath)}`,
      },
    },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "X-Robots-Tag": "noindex, nofollow",
        "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400",
      },
    }
  );
}
