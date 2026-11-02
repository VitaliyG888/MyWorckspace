# Architecture

Modular monolith, Next.js App Router.

```
Browser UI
  -> Route handlers (src/app/api)
    -> Orchestrator
      -> Specialist agents (interview, architect, visual, copy, blocks, motion, SEO, QA, image, articles)
        -> LLM Gateway
          -> Protocol adapters
    -> File-backed store (data/studio.json)
    -> AES-256-GCM secret envelope
```

## Source of truth

`SiteDocument` JSON. The visual editor, AI pipeline and renderer all read/write the same document.

## Persistence

MVP uses `data/studio.json` with a write queue. PostgreSQL + Drizzle is the planned production store (see `docs/adr/0001-modular-monolith.md`).

## Security

- Secrets never leave the server.
- Custom URLs are checked against private/metadata ranges.
- Preview CSS is isolated via canvas tokens, not by executing model-produced JavaScript.
