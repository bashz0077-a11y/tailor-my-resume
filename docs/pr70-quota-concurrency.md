# PR70 — concurrent quota and failure semantics

## Running the concurrency test

Use a **separate disposable Supabase project**, with the PR64 and PR67 migrations applied. Create a dedicated test account through normal Supabase Auth and verify it has zero uses. Do not use the production TailorMyResume database or real customers.

Set `TEST_SUPABASE_URL`, `TEST_SUPABASE_ANON_KEY`, `TEST_USER_EMAIL`, `TEST_USER_PASSWORD`, and `CONFIRM_DISPOSABLE_TEST_PROJECT=yes` in a local test shell. Run `npx tsx tests/ai-quota-concurrency.ts` (tsx is a test runner, not a production dependency). The harness sends ten simultaneous RPC requests and asserts exactly three succeed, the fourth is rejected, and usage equals three. It will fail if credentials or a disposable environment are unavailable; **do not claim it passed without executing it**.

## Failed Gemini generations

Current implementation consumes one quota claim before Gemini starts. A provider timeout, error, or invalid generation still consumes that claim. This is conservative against cost abuse, but can be unfair to users. **Do not automatically refund failed calls**: concurrent retries could otherwise defeat quota protection. A safe refund needs a unique request ID, an atomic claim/finalize lifecycle, idempotency, and a clear policy for billable provider failures. Implement and test separately before enabling paid AI.

## Release gate

- Concurrent RPC test passes with isolated test account
- Deployed bearer-token authentication, expired sessions, and user-isolation tested
- Gemini failure/timeout charging policy accepted and tested
- UI distinguishes local fallback from actual Gemini quota
- Provider-side spending limit verified

Gemini stays disabled by default until the gate passes.
