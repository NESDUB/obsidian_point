# Apple Docs Live DocC POC

This proof-of-concept adds a public, unlisted Apple documentation translation gateway to the Next.js app.

It does **not** host the full Apple framework corpus. It fetches a requested Apple documentation page's DocC JSON directly from Apple, translates the JSON into AI-readable Markdown/JSON, and returns that through your website.

## Added routes

```text
/r/apple-docs/poc
/r/apple-docs/poc/open?path=documentation/Speech/SpeechAnalyzer&format=markdown
/r/apple-docs/poc/open?path=documentation/Speech/SpeechAnalyzer&format=json
/r/apple-docs/poc/health
/r/apple-docs/poc/llms.txt
```

## Files added

```text
src/lib/apple-docs/docc.ts
src/app/(public)/r/apple-docs/poc/page.tsx
src/app/(public)/r/apple-docs/poc/open/route.ts
src/app/(public)/r/apple-docs/poc/health/route.ts
src/app/(public)/r/apple-docs/poc/llms.txt/route.ts
```

## File changed

```text
middleware.ts
```

The middleware now bypasses `/r/*` routes before Supabase session handling, so the public research gateway does not depend on dashboard auth.

## Test URLs after deploy

```text
https://obsidianpoint.co/r/apple-docs/poc
https://obsidianpoint.co/r/apple-docs/poc/health
https://obsidianpoint.co/r/apple-docs/poc/llms.txt
https://obsidianpoint.co/r/apple-docs/poc/open?format=markdown&path=documentation/Speech/SpeechAnalyzer
https://obsidianpoint.co/r/apple-docs/poc/open?format=json&path=documentation/Speech/SpeechAnalyzer
https://obsidianpoint.co/r/apple-docs/poc/open?format=markdown&path=documentation/FoundationModels/LanguageModelSession
```

## Expected success result

The `open` endpoint should return a Markdown or JSON brief with:

```text
title
framework
role
normalized path
official Apple URL
Apple DocC JSON URL
abstract
availability
content sections
topic/related sections
code blocks if present
```

## Notes

- This route is public if someone knows the URL.
- It uses `X-Robots-Tag: noindex, nofollow`.
- It uses `Cache-Control: s-maxage=3600, stale-while-revalidate=86400`.
- The route handler uses `runtime = "nodejs"`.
- No Supabase tables, storage bucket, or object storage are required for this POC.
- If Apple blocks or changes the DocC JSON endpoint, the route will return a clear error.
