# External game links — review-gated pilot

This branch introduces a separate `/discover/[slug]` route and a typed external-game registry.

## Safety and publication
- All candidates start with `status: 'draft'` and are NOT emitted by `generateStaticParams`. No public detail page is created for a draft.
- Only a deliberate review changes status to `approved`. Approval is mandatory for every publicly listed game, including external links, remixes, AI and non-AI games.
- No candidate is added to the games browser, sitemap, navigation, or production homepage yet.
- URLs must point to the verified creator-controlled destination. Do not proxy downloads or collect visitors' API keys.
- Confirm screenshots, covers, trademarks, third-party assets, and source license before approval.
- Before release, confirm the route is included in the intended navigation/sitemap and update wording that says all games play instantly.

## Candidates
- Veloren — official download website
- Microverse — source/demo instructions; not a direct web game
- Moot Court Simulator — external hosted demo, possible API requirements

## Next checks
1. Run `pnpm install --frozen-lockfile && pnpm lint && pnpm build && pnpm test:e2e`.
2. Inspect generated routes; confirm drafts do not generate public pages.
3. Review official URL ownership, rights and destination availability.
4. Create a PR; request explicit approval before promoting any candidate.
