# PR65 — AI quota security review

## Live checks (2026-10-18)

- `public.ai_usage_quotas` exists with RLS enabled.
- `anon` cannot execute `public.claim_ai_tailor_use()`.
- `authenticated` has EXECUTE only on the claim function, not direct SELECT/UPDATE on quota table.
- Running `set local role authenticated; select public.claim_ai_tailor_use();` **without a JWT** returned `false` (rolled back).
- The API checks the bearer token via `supabase.auth.getUser(bearer)` before calling the claim function.
- Gemini remains disabled unless `ENABLE_PAID_AI=true` and an API key are set.

## Advisor findings

1. **RLS enabled, no policy (INFO)**: intentional. The quota table is inaccessible to client roles; the narrow RPC handles claims. Do not add a broad policy to silence the informational lint.
2. **Authenticated SECURITY DEFINER callable (WARN)**: intentional but security-sensitive. The function has `search_path=''`, uses `auth.uid()`, only modifies the caller's own counter, and allows at most three lifetime claims. It does not return quota records. It is exposed to signed-in users by design. The warning remains, and the function should be independently audited before enabling Gemini.

## Remaining validation before enabling Gemini

- Test actual signed-in accounts A and B separately (1st, 2nd, 3rd claims true; 4th false).
- Verify simultaneous claims cannot exceed three.
- Verify invalid/expired bearer tokens receive 401.
- Verify no Gemini call occurs on quota failure or with the flag disabled.
- Verify client localStorage usage badge is synchronized with server quota (currently **not synchronized**).
- A failed Gemini generation still consumes a claim; decide refund/retry policy.
- Check provider-level spending limits and disable Gemini until reviewed.

**No new SQL or permission changes in this PR.** This review does not assert successful end-to-end multi-user testing.
