# MiniPlay

Static-first browser game MVP built with Next.js App Router, TypeScript, Canvas, CSS, and lightweight browser APIs. It includes Number Merge, Snake, Sudoku, Klondike Solitaire, and Emoji Memory.

## Requirements and local setup

This repository uses pnpm 11.19.0, declared in `package.json`.

```bash
corepack enable
pnpm install
cp .env.example .env.local
pnpm dev
```

Set `NEXT_PUBLIC_SITE_URL` before a production build. It is the single source for canonical URLs, Open Graph URLs, JSON-LD, sitemap entries, and the robots sitemap reference. `NEXT_PUBLIC_CONTACT_EMAIL` is optional; the contact page hides the address until configured.

```bash
pnpm lint
pnpm test:e2e
pnpm build
```

Playwright runs desktop and 375×812 mobile projects. Install its Chromium build with `pnpm exec playwright install chromium` when a compatible Chrome installation is unavailable.

## Deploy to Vercel

1. Import the GitHub repository into Vercel.
2. Add `NEXT_PUBLIC_SITE_URL=https://your-production-domain.com`.
3. Optionally add `NEXT_PUBLIC_CONTACT_EMAIL`.
4. Use `pnpm build` with the detected Next.js output.
5. Verify `/sitemap.xml`, `/robots.txt`, canonical tags, and one game page after deployment.

Cloudflare DNS or CDN can be connected later without changing game logic. There is no persistent server, database, login, tracking SDK, analytics integration, or real advertising ID.

## Architecture and browser data

Game metadata lives in `src/data/games.ts`. Each game is dynamically imported through `src/games/GameLoader.tsx`, so opening the home page does not execute every game component. Browser state uses safe helpers and the `miniplay:*` localStorage namespace.

## Add a future game

1. Add metadata and original editorial content to `src/data/games.ts`.
2. Create `src/games/<slug>/Game.tsx` using `GameShell`.
3. Add its dynamic import to `src/games/GameLoader.tsx`.
4. Add desktop and mobile Playwright coverage.

The entry then appears in search, categories, related games, static params, and the sitemap.

## Copyright

MiniPlay's original source code and content are proprietary. See `LICENSE`. Third-party dependencies retain their respective licenses as documented in `THIRD_PARTY_LICENSES.md`.
