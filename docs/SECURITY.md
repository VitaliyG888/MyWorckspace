# Security

- Tenant isolation is workspace-scoped in the store (`workspace_id` on projects).
- Provider secrets: AES-256-GCM, master key from `STUDIO_MASTER_KEY`.
- SSRF guard on custom endpoints.
- No model-produced JavaScript is executed.
- `.env.example` contains placeholders only.
