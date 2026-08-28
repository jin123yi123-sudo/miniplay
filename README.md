# MiniPlay

Static-first browser game MVP built with Next.js, TypeScript, Tailwind CSS, Canvas, CSS, and emoji.

## Run

```bash
npm install
npm run dev
npm run build
```

Deploy by importing the repository into Vercel. Replace the placeholder URL and email in `src/config/site.ts`. Cloudflare DNS/CDN can be connected later.

## Add a game

1. Add metadata to `src/data/games.ts`.
2. Create `src/games/<slug>/Game.tsx` using `GameShell`.
3. Add its dynamic import to `src/games/GameLoader.tsx`.

It then appears in search, categories, related games, and the sitemap. Gameplay is local; there is no database, login, tracking SDK, or real advertising ID. Browser state uses the `miniplay:*` namespace.
