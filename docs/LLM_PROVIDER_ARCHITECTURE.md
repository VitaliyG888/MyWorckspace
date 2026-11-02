# LLM provider architecture

Gateway: `src/lib/llm/gateway.ts`.

Protocols:

- `openai-chat-completions`
- `openai-responses`
- `anthropic-messages`
- `google-generative`
- `ollama`
- `image-openai` / `image-openai-compatible`
- `demo`
- `custom` (Chat Completions fallback)

Each model has an explicit capability matrix. If structured output is missing, JSON is parsed and validated locally.

Role assignments map every agent to `{providerId, modelId}` plus optional fallback.

Keys are envelope-encrypted. The client only sees `hasSecret`.
