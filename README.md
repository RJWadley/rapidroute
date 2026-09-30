This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

Install dependencies and run the development server:

```bash
pnpm install
pnpm dev
```

The project pins pnpm 12 and uses `devEngines.runtime` to download Node.js 24
automatically during installation. `pnpm dev`, `pnpm build`, and `pnpm exec`
use that runtime; a separate global Node.js upgrade is unnecessary. Run
`pnpm exec node --version` to check the project's Node.js version.

To upgrade pnpm itself, use its [standalone installer](https://pnpm.io/installation#using-a-standalone-script)
and reopen your terminal. Older Corepack shims may not support pnpm 12's native
executable.

Project pnpm settings live in `pnpm-workspace.yaml`, including the React version
catalog, dependency overrides, and allowed dependency build scripts.

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Wiki research and automatic logo guesses use the Google API key in
`GOOGLE_GENERATIVE_AI_API_KEY`. Copy `.env.example` to `.env.local` and set the
key for local development. `GOOGLE_WIKI_MODEL` optionally changes the model;
the default is `gemini-3.5-flash-lite`.

Summaries use an AI SDK `ToolLoopAgent` to search for the right article, compare
candidates using destination context, follow wiki links, and inspect actual
image pixels. The destination guide includes a short overview, up to three
source-backed highlights, and an optional photo. A tRPC SSE subscription streams
actual search, article-reading, and image-inspection progress, then delivers the
result into the query cache. Summary sources and selected images link to their
wiki pages; the full article is available in an expandable section.
The place panel's Generated overviews toggle is remembered on this browser.
When switched off, a separate wiki-only endpoint restores the original article
lookup: exact titles first, then partial title matches, then wiki text search.
Curated articles and existing dataset wiki links take priority.
It copies the article's lead paragraphs and
displays manually selected photos and the full article, without calling the
generation engine. Related results and disambiguation pages are labelled clearly.
If the lookup finds nothing, the toggle and a wiki-search link remain available.
The browser preference is loaded before
either view mounts, including after a reload. The two views use separate query caches.

Wiki-only curation lives in `app/data/wikiArticles.ts`, keyed by RapidRoute place
ID (the ID in `/place/…`, with spaces in town names replaced by `+`). Each entry
specifies an article title, an optional world to guard against name collisions,
and an optional exact wiki image filename. An omitted image means no photo;
flags and logos are never substituted. Existing airport wiki links in Gatelogue
also provide article matches. Article text and image URLs refresh from the wiki
daily. These choices apply to the wiki-only view; generated mode researches independently.

Each generated request allows at most six model calls, four searches, six articles, and
four image inspections, with a one-minute research deadline. Successful
summaries are shared for a day; wiki reads and model responses also use the
daily server fetch cache. If research fails or no API key is configured, the
original article remains available without a generated summary.

Wiki logo overrides take priority over automatic guesses.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
