# PR56 — Job seeker and employer workflow QA

## Implemented
- Application status check now catches network failures and ignores stale results after the component unmounts or job changes.
- Apply submission always resets its loading state, including on auth and network failures.
- Application errors are user-friendly rather than exposing raw database error messages.

## Manual staging test matrix (not yet executed)
1. Signed-out user sees sign-in prompt; signed-in job seeker can apply to an open job once.
2. Duplicate applications display already-applied state; a closed/expired job cannot accept new applications.
3. My Applications displays only the current user's rows, filters/search/sorts correctly, and exports only visible results.
4. Save and unsave jobs, reload Saved Jobs, and test cross-account session switching.
5. Employer creates draft, publishes, closes and edits only own jobs; a second employer cannot read or change private drafts.
6. Employer applicant list shows only applications to own jobs; status changes propagate to the applicant's My Applications view.
7. Attempt to alter applicant_id, job_id, cover_note via direct API request; database should reject these changes by employers.
8. Test network failures, expired auth sessions, repeated taps, and 360px mobile layout.

**Release gate:** Vercel build success is not an end-to-end test. Live cross-account checks are blocked until the correct TailorMyResume Supabase project is connected. Public profile exposure and overly broad application UPDATE privileges identified in PR54 still require remediation.
