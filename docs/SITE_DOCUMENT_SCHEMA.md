# Site document schema

Canonical types live in `src/lib/schema/site-document.ts` and `src/lib/blocks/schemas.ts`.

- `SiteDocument`: id, brief, tokens, pages, sitemap
- `PageDocument`: slug, purpose, seo, sections
- `SectionDocument`: type, variant, props, motion, status, generationMetadata

Statuses: `planned | queued | generating | validating | ready | failed | skipped`.

A section becomes `ready` only after Zod + content checks pass.
