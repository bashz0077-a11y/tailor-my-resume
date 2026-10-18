# PR65 — AI quota security review

## Live database checks (2026-10-18)
- Quota table exists, with RLS enabled and no client table SELECT/UPDATE grants.
- `authenticated` may execute `public.claim_ai_tailor_use()`; `anon` cannot.
- In a transaction with `SET LOCAL ROLE authenticated` but no auth JWT, `claim_ai_tailor_use()` returned `false`. No quota was consumed.
- The quota uses an atomic `INSERT ... ON CONFLICT DO UPDATE ... WHERE uses < 3` to cap lifetime successful claims per user at three.
- The function reads `auth.uid()` and only writes a row keyed to that UID; it takes no caller-supplied user ID.

## Security advisor findings
1. INFO: `rls_enabled_no_policy` on `public.ai_usage_quotas`. Intentional deny-all: the table is accessed exclusively via a privileged function, and clients have no table grants. Adding a permissive RLS policy would weaken isolation.
2. WARN: `authenticated_security_definer_function_executable` on `public.claim_ai_tailor_use()`. Intentional but not risk-free: signed-in users can call the RPC directly, which spends **their own** quota. The function cannot claim for another user and cannot increase beyond three. Do not treat this advisory as automatically resolved.

## Outstanding before enabling Gemini
- Test with two separate authenticated accounts, including simultaneous requests and exhausted quotas; these tests have **not** been run.
- UI browser counter is not synchronized with database credits; users can encounter server 429 before UI shows zero.
- Each claim is consumed **before** Gemini runs; provider failure still spends a credit.
- Three requests can involve multiple provider calls each. Configure external billing limits and monitor costs.
- Keep `ENABLE_PAID_AI` unset or false until these checks are completed.

No SQL migration in PR65. This is a documented audit, not a claim that the application is fully production-ready.
