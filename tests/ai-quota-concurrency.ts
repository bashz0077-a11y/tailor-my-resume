/**
 * PR70 isolated quota concurrency harness.
 * Run only against a disposable Supabase test project.
 *
 * Required environment:
 * TEST_SUPABASE_URL, TEST_SUPABASE_ANON_KEY,
 * TEST_USER_EMAIL, TEST_USER_PASSWORD
 *
 * The test account must be disposable and must have zero existing AI uses.
 * No Gemini calls are made. Running this consumes exactly 3 test-account quota uses.
 */
import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";

const env = (name: string): string => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}`);
  return value;
};

async function main() {
  const url = env("TEST_SUPABASE_URL");
  const key = env("TEST_SUPABASE_ANON_KEY");
  const email = env("TEST_USER_EMAIL");
  const password = env("TEST_USER_PASSWORD");
  if (!/localhost|127\.0\.0\.1|\.test\b/.test(url) && process.env.CONFIRM_DISPOSABLE_TEST_PROJECT !== "yes") {
    throw new Error("Set CONFIRM_DISPOSABLE_TEST_PROJECT=yes after verifying this is a disposable project.");
  }
  const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: auth, error: authError } = await client.auth.signInWithPassword({ email, password });
  assert.ifError(authError);
  assert.ok(auth.session, "A real test-user session is required");
  const { data: before, error: beforeError } = await client.rpc("get_ai_tailor_uses");
  assert.ifError(beforeError);
  assert.equal(before, 0, "Test account must start at zero; do not reset live accounts");

  const claims = await Promise.all(Array.from({ length: 10 }, async () => {
    const { data, error } = await client.rpc("claim_ai_tailor_use");
    assert.ifError(error);
    assert.equal(typeof data, "boolean");
    return data;
  }));
  assert.equal(claims.filter(Boolean).length, 3, "Exactly three concurrent claims must succeed");
  const { data: after, error: afterError } = await client.rpc("get_ai_tailor_uses");
  assert.ifError(afterError);
  assert.equal(after, 3);
  const { data: fourth, error: fourthError } = await client.rpc("claim_ai_tailor_use");
  assert.ifError(fourthError);
  assert.equal(fourth, false);
  console.log("PASS: ten simultaneous claims granted exactly three; fourth denied; final usage three.");
}
main().catch((error: unknown) => {
  console.error("Quota concurrency test failed:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
