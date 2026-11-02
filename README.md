# AI Website Studio

Multi-agent platform for professional website production. Design, copy, blocks, motion, SEO and images are handled by separate agents coordinated by an orchestrator LLM.

## What works now

- Custom LLM / image / content provider connections from the first screen
- Per-role model assignment (interviewer, architect, visual director, copywriter, block builder, motion, SEO, QA, image, articles)
- Adaptive interview that persists a typed `SiteBrief`
- Incremental JSON-first site generation with schema validation
- Visual builder: select, edit, reorder, delete, regenerate one block
- Live preview (desktop / tablet / mobile) and isolated preview route
- Lead capture into the studio (success only after storage)
- Webhook integration with real `connected` / `requires-setup` statuses
- JSON export of `SiteDocument` plus HTML snapshot
- Offline demo provider so the product works without external keys

## Run

```bash
# Install dependencies
npm install

# Copy env template and set a master key for secret encryption
cp .env.example .env.local

# Start the app
npm run dev
```

Open `http://localhost:3000`.

## Scripts

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

## Stack

Next.js 15 App Router, React 19, TypeScript strict, Tailwind CSS 4, Zod, file-backed workspace store, AES-256-GCM secret envelope.

PostgreSQL, Redis/BullMQ and object storage are documented as the next persistence step. The MVP uses a durable JSON store under `data/` so the product runs without extra infrastructure.

## Docs

- `docs/PRD.md`
- `docs/ARCHITECTURE.md`
- `docs/AI_GENERATION_PIPELINE.md`
- `docs/LLM_PROVIDER_ARCHITECTURE.md`
- `docs/SITE_DOCUMENT_SCHEMA.md`
- `docs/ROADMAP.md`
