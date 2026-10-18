# PR63 — AI cost safety gate

The existing 3-use limit is enforced in browser localStorage, not on the server. It is trivial to bypass with direct POST requests, and the server can issue multiple Gemini calls per request.

## Default behavior
- Unless `ENABLE_PAID_AI=true` **and** `GEMINI_API_KEY` is configured, the `/api/tailor` endpoint uses the existing `localTailor` fallback and makes **zero Gemini API calls**.
- No additional service, database table, paid product, or secret is required.
- The UI still displays 3 browser uses; this is **not** a server-enforced quota.
- Gemini AI generation/scoring is intentionally unavailable by default, so output quality and behavior may differ from AI results.

## Important limitation
Enabling `ENABLE_PAID_AI=true` re-enables the **unprotected** Gemini path. Do not enable it on a public production deployment until server-side authentication, durable per-user quotas, abuse throttling, and a provider spending cap are implemented and tested. This is a safe-default containment change, not a complete rate-limiting solution.

## Checks
1. Without ENABLE_PAID_AI, valid POST returns localTailor result without contacting Gemini.
2. With ENABLE_PAID_AI=false and a valid key, still no Gemini calls.
3. With ENABLE_PAID_AI=true and valid key, Gemini path remains accessible; this mode is **not launch-safe**.
4. Oversize/malformed JSON still rejected before either branch.
