import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Apple Docs Gateway | Obsidian Point",
  description: "Apple Developer Documentation research gateway — search, brief, and open.",
  robots: {
    index: false,
    follow: false,
  },
};

const sampleSearches = [
  { q: "SpeechAnalyzer", framework: "Speech" },
  { q: "liquid glass", framework: "SwiftUI" },
  { q: "guided generation", framework: "FoundationModels" },
  { q: "GlassEffectContainer" },
];

const samplePaths = [
  "documentation/Speech/SpeechAnalyzer",
  "documentation/FoundationModels/LanguageModelSession",
  "documentation/SwiftUI/GlassEffectContainer",
];

export default function AppleDocsGatewayPage() {
  return (
    <main className="min-h-screen bg-[#08090d] px-6 py-10 text-white">
      <div className="mx-auto flex max-w-4xl flex-col gap-8">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-black/40">
          <p className="mb-3 text-sm uppercase tracking-[0.28em] text-orange-300/80">Obsidian Point Research Gateway</p>
          <h1 className="text-4xl font-semibold tracking-tight">Apple Docs Gateway v1</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/70">
            Search 344,851 pages across 391 Apple frameworks. Full document content is fetched live from Apple — always fresh, never stale. Designed for AI research workflows.
          </p>
        </section>

        {/* Workflow */}
        <section className="rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-6">
          <h2 className="text-xl font-semibold">AI workflow</h2>
          <div className="mt-4 grid gap-3">
            <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
              <div className="flex items-baseline gap-3">
                <span className="rounded-full bg-orange-400/20 px-2.5 py-1 text-xs font-bold text-orange-300">1</span>
                <code className="text-sm font-semibold text-white">/r/apple-docs/brief</code>
              </div>
              <p className="mt-2 text-sm text-white/60">Research a topic. Searches the index, live-fetches top results from Apple, returns everything in one response.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
              <div className="flex items-baseline gap-3">
                <span className="rounded-full bg-orange-400/20 px-2.5 py-1 text-xs font-bold text-orange-300">2</span>
                <code className="text-sm font-semibold text-white">/r/apple-docs/search</code>
              </div>
              <p className="mt-2 text-sm text-white/60">Discover doc paths. Fast metadata-only search with direct open URLs in results.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
              <div className="flex items-baseline gap-3">
                <span className="rounded-full bg-orange-400/20 px-2.5 py-1 text-xs font-bold text-orange-300">3</span>
                <code className="text-sm font-semibold text-white">/r/apple-docs/poc/open/[...path]</code>
              </div>
              <p className="mt-2 text-sm text-white/60">Expand a single document. Use when you need the full page for a known path.</p>
            </div>
          </div>
        </section>

        {/* Search */}
        <section className="rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-6">
          <h2 className="text-xl font-semibold">Try a search</h2>
          <form className="mt-4 flex flex-col gap-3" action="/r/apple-docs/search" method="get">
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                name="q"
                placeholder="Search query (e.g. SpeechAnalyzer)"
                defaultValue="SpeechAnalyzer"
                className="flex-1 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 font-mono text-sm text-white outline-none ring-orange-400/40 focus:ring-2"
              />
              <input
                name="framework"
                placeholder="Framework (optional)"
                className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 font-mono text-sm text-white outline-none ring-orange-400/40 focus:ring-2 sm:w-48"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                className="rounded-full bg-orange-400 px-5 py-3 text-sm font-semibold text-black transition hover:bg-orange-300"
                type="submit"
              >
                Search
              </button>
            </div>
          </form>
        </section>

        {/* Sample searches */}
        <section className="rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-6">
          <h2 className="text-xl font-semibold">Sample searches</h2>
          <div className="mt-4 grid gap-3">
            {sampleSearches.map((s) => {
              const params = new URLSearchParams({ q: s.q, ...(s.framework ? { framework: s.framework } : {}), limit: "5" });
              const briefParams = new URLSearchParams({ q: s.q, ...(s.framework ? { framework: s.framework } : {}), open: "2" });
              return (
                <div key={s.q} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                  <code className="block text-sm text-white/80">
                    q={s.q}{s.framework ? ` framework=${s.framework}` : ""}
                  </code>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <a className="rounded-full bg-white/10 px-3 py-2 text-xs font-medium text-white hover:bg-white/15" href={`/r/apple-docs/brief?${briefParams}`}>Brief</a>
                    <a className="rounded-full bg-white/10 px-3 py-2 text-xs font-medium text-white hover:bg-white/15" href={`/r/apple-docs/search?${params}`}>Search</a>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Open a path */}
        <section className="rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-6">
          <h2 className="text-xl font-semibold">Open a specific document</h2>
          <form className="mt-4 flex flex-col gap-3" action="/r/apple-docs/poc/open" method="get">
            <input
              name="path"
              defaultValue="documentation/Speech/SpeechAnalyzer"
              className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 font-mono text-sm text-white outline-none ring-orange-400/40 focus:ring-2"
            />
            <div className="flex flex-wrap gap-3">
              <button className="rounded-full bg-orange-400 px-5 py-3 text-sm font-semibold text-black transition hover:bg-orange-300" type="submit" name="format" value="markdown">Markdown</button>
              <button className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10" type="submit" name="format" value="json">JSON</button>
            </div>
          </form>
          <div className="mt-4 grid gap-2">
            {samplePaths.map((path) => (
              <div key={path} className="flex flex-wrap items-center gap-2">
                <code className="text-xs text-white/50">{path}</code>
                <a className="rounded-full bg-white/10 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-white/15" href={`/r/apple-docs/poc/open/${path}?format=markdown`}>MD</a>
                <a className="rounded-full bg-white/10 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-white/15" href={`/r/apple-docs/poc/open/${path}?format=json`}>JSON</a>
              </div>
            ))}
          </div>
        </section>

        {/* Endpoint reference */}
        <section className="rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-6 text-sm leading-7 text-white/70">
          <h2 className="mb-3 text-xl font-semibold text-white">Endpoint reference</h2>
          <pre className="overflow-x-auto rounded-2xl bg-black/40 p-4 text-xs text-white/80">{`GET /r/apple-docs/brief?q=...&framework=...&open=3&limit=8
GET /r/apple-docs/search?q=...&framework=...&limit=20
GET /r/apple-docs/poc/open/{documentation/Framework/Symbol}?format=json|markdown
GET /r/apple-docs/poc/health
GET /r/apple-docs/poc/llms.txt`}</pre>
          <p className="mt-4">
            This gateway is unlisted and marked noindex. All endpoints return CORS-open responses.
          </p>
        </section>
      </div>
    </main>
  );
}
