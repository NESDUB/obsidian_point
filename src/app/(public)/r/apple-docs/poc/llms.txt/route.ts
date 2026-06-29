export const runtime = "nodejs";

export async function GET() {
  const body = `# Obsidian Point Apple Docs Live DocC POC

This proof-of-concept gateway fetches Apple Developer Documentation DocC JSON live from Apple's servers and renders AI-readable Markdown or structured JSON.

Base route:
/r/apple-docs/poc

Open a page as Markdown:
/r/apple-docs/poc/open?format=markdown&path=documentation/Speech/SpeechAnalyzer

Open a page as JSON:
/r/apple-docs/poc/open?format=json&path=documentation/Speech/SpeechAnalyzer

You can also pass a developer.apple.com documentation URL:
/r/apple-docs/poc/open?format=markdown&url=https%3A%2F%2Fdeveloper.apple.com%2Fdocumentation%2Fspeech%2Fspeechanalyzer

Health check:
/r/apple-docs/poc/health

Use this POC to verify the live translation layer. It is not a full search gateway yet.
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
