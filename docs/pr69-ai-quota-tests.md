# PR69 — AI quota verification

The SQL test in `supabase/tests/ai_usage_quota_sequential.sql` runs inside a transaction that is always rolled back. It checks that the first three requests claim quota, the fourth is denied, usage reads return three, accounts are isolated, and missing JWT identities cannot claim. The database uses an atomic `INSERT ... ON CONFLICT DO UPDATE ... WHERE uses < 3` statement, but this sequential test **does not prove concurrent safety**.

## Concurrent test still required

Run an isolated two-session test against a disposable database with a real test auth identity. Have both sessions call `claim_ai_tailor_use()` simultaneously from a starting quota of 2. Assert exactly one succeeds, the other returns false, and the final count is 3. Repeat with a starting quota of 0 and 10 simultaneous claims; exactly three should succeed. Do not use production accounts or turn on Gemini to test the database.

## Before enabling Gemini

Verify valid/expired bearer tokens through the deployed API, confirm the UI counter reflects a signed-in account across browsers, test provider failures and decide whether failed AI generations consume quota. Add per-account and global cost budgets. Keep `ENABLE_PAID_AI` disabled until these checks pass.

## Known limitation

Browser localStorage is still incremented after local fallback responses, and the header badge can show browser counts even while Gemini is disabled. This is not a reliable paid AI entitlement indicator and should be corrected in a separate UI PR.
