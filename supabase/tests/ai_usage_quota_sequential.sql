-- PR69: transactional quota regression tests. Safe to run in a test database.
-- All inserted auth and quota rows are rolled back.
begin;
do $test$
declare
  test_user uuid := gen_random_uuid();
  other_user uuid := gen_random_uuid();
  attempt integer;
  accepted boolean;
  current_uses integer;
begin
  insert into auth.users (id, instance_id, aud, role, email, encrypted_password, created_at, updated_at)
  values
    (test_user, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'quota-test-' || test_user || '@example.invalid', '', now(), now()),
    (other_user, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'quota-test-' || other_user || '@example.invalid', '', now(), now());
  perform set_config('request.jwt.claim.sub', test_user::text, true);
  set local role authenticated;
  for attempt in 1..4 loop
    select public.claim_ai_tailor_use() into accepted;
    if accepted is distinct from (attempt <= 3) then
      raise exception 'Expected attempt % to be %, got %', attempt, attempt <= 3, accepted;
    end if;
  end loop;
  select public.get_ai_tailor_uses() into current_uses;
  if current_uses <> 3 then raise exception 'Expected 3 used, got %', current_uses; end if;
  perform set_config('request.jwt.claim.sub', other_user::text, true);
  select public.get_ai_tailor_uses() into current_uses;
  if current_uses <> 0 then raise exception 'User isolation failed'; end if;
  select public.claim_ai_tailor_use() into accepted;
  if not accepted then raise exception 'Second user first claim failed'; end if;
  perform set_config('request.jwt.claim.sub', '', true);
  select public.claim_ai_tailor_use() into accepted;
  if accepted then raise exception 'Missing JWT unexpectedly allowed claim'; end if;
end;
$test$;
rollback;
