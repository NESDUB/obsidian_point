import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Apple Docs Live DocC POC | Obsidian Point",
  description: "Proof-of-concept live Apple DocC translation endpoint.",
  robots: {
    index: false,
    follow: false,
  },
};

const samples = [
  "documentation/Speech/SpeechAnalyzer",
  "documentation/Speech/SpeechTranscriber",
  "documentation/Speech/bringing-advanced-speech-to-text-capabilities-to-your-app",
  "documentation/FoundationModels/LanguageModelSession",
];

export default function AppleDocsPOCPage() {
  return (
    <main className="min-h-screen bg-[#08090d] px-6 py-10 text-white">
      <div className="mx-auto flex max-w-4xl flex-col gap-8">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-black/40">
          <p className="mb-3 text-sm uppercase tracking-[0.28em] text-orange-300/80">Obsidian Point Research Gateway</p>
          <h1 className="text-4xl font-semibold tracking-tight">Apple Docs Live DocC POC</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/70">
            This proof-of-concept fetches Apple documentation DocC JSON directly from Apple, translates it into AI-readable Markdown or JSON, and returns it from this site without hosting the full offline Apple framework library.
          </p>
        </section>

        <section className="rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-6">
          <h2 className="text-xl font-semibold">Try a documentation path</h2>
          <form className="mt-4 flex flex-col gap-3" action="/r/apple-docs/poc/open" method="get">
            <label className="text-sm text-white/70" htmlFor="path">
              Apple documentation path or developer.apple.com URL
            </label>
            <input
              id="path"
              name="path"
              defaultValue="documentation/Speech/SpeechAnalyzer"
              className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 font-mono text-sm text-white outline-none ring-orange-400/40 focus:ring-2"
            />
            <div className="flex flex-wrap gap-3">
              <button
                className="rounded-full bg-orange-400 px-5 py-3 text-sm font-semibold text-black transition hover:bg-orange-300"
                type="submit"
                name="format"
                value="markdown"
              >
                Open as Markdown
              </button>
              <button
                className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                type="submit"
                name="format"
                value="json"
              >
                Open as JSON
              </button>
            </div>
          </form>
        </section>

        <section className="rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-6">
          <h2 className="text-xl font-semibold">Sample links</h2>
          <div className="mt-4 grid gap-3">
            {samples.map((sample) => (
              <div key={sample} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                <code className="block break-all text-sm text-white/80">{sample}</code>
                <div className="mt-3 flex flex-wrap gap-2">
                  <a
                    className="rounded-full bg-white/10 px-3 py-2 text-xs font-medium text-white hover:bg-white/15"
                    href={`/r/apple-docs/poc/open?format=markdown&path=${encodeURIComponent(sample)}`}
                  >
                    Markdown
                  </a>
                  <a
                    className="rounded-full bg-white/10 px-3 py-2 text-xs font-medium text-white hover:bg-white/15"
                    href={`/r/apple-docs/poc/open?format=json&path=${encodeURIComponent(sample)}`}
                  >
                    JSON
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-6 text-sm leading-7 text-white/70">
          <h2 className="mb-3 text-xl font-semibold text-white">Endpoint contract</h2>
          <pre className="overflow-x-auto rounded-2xl bg-black/40 p-4 text-xs text-white/80">{`GET /r/apple-docs/poc/open?path=documentation/Speech/SpeechAnalyzer&format=markdown
GET /r/apple-docs/poc/open?url=https://developer.apple.com/documentation/speech/speechanalyzer&format=json
GET /r/apple-docs/poc/health
GET /r/apple-docs/poc/llms.txt`}</pre>
          <p className="mt-4">
            This is intentionally unlisted and marked noindex. Treat it as public if someone knows the URL.
          </p>
        </section>
      </div>
    </main>
  );
}
