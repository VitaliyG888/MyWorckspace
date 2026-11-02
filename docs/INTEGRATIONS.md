# Integrations

Implemented now:

- Local lead store (`connected`)
- Custom webhook forwarder (connected only when URL is saved)

Catalogued, not connected:

- HubSpot, Bitrix24, GA4, Meta Pixel — shown as `requires-setup`

Lead POST `/api/leads` stores first, then forwards. Success in the UI means a record exists.
