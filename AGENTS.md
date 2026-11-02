# AGENTS.md — AI Website Studio

## Product rule

Do not fake working UI. If a capability is incomplete, mark it `requires-setup`, `Not connected` or `Coming later`. Never persist a `ready` block that fails schema or content checks.

## Commands

```bash
npm install
npm run dev
npm run typecheck
npm run lint
npm test
npm run build
```

## Architecture constraints

- JSON-first `SiteDocument` is the only source of truth for pages.
- LLM calls go through `src/lib/llm/gateway.ts`. UI components must not call providers directly.
- Each agent role has its own assignment. The orchestrator coordinates; specialists do not rewrite each other's outputs except through the repair loop.
- Motion agent may change only `MotionConfig`.
- API keys are encrypted server-side. Never return ciphertext or plaintext secrets to the client.
- Custom provider URLs must pass SSRF checks. Local LLM hosts require an explicit allow flag.

## Key modules

- `src/lib/schema/` — Zod contracts
- `src/lib/llm/` — gateway, adapters, capability routing
- `src/lib/agents/` — orchestrator and specialists
- `src/lib/blocks/` — registry, validation, renderer
- `src/lib/store/db.ts` — workspace persistence
- `src/app/api/` — HTTP surface

## Testing

Add unit tests next to the module (`*.test.ts`). Cover schema validation, secret roundtrip, JSON extraction and brief merging at minimum.
