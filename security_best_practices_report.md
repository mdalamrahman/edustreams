# Security Review and Remediation

The review found exposed credentials, missing server authorization, unsafe database policies, authentication bypasses, and racing financial writes. Code fixes and isolated tests are included. Production configuration, credential rotation, and database migration have not been executed.

## Critical findings addressed

1. **Browser and repository secrets** — `src/lib/redis.ts`, `src/lib/supabase.ts`, `src/lib/passkey.ts`, `backend/r2_storage.py`, diagnostic scripts, and tracked session files contained privileged credentials or universal codes. Attackers could recover secrets from source or bundles. Browser clients now use public configuration and authenticated proxies; server secrets come from environment variables. Scratch/session files remain local and are excluded from the next Git snapshot. Rotate the exposed credentials and assess history access.
2. **Unauthenticated administrative and financial operations** — administrative, passkey, billing, artifact-write, and provider routes lacked a common authorization boundary. `backend/security.py` now verifies Supabase sessions and checks server-controlled administrator metadata. Cross-user identity requests are rejected; interview details and attempt history are owner-scoped. Tests include anonymous users, expired sessions, ordinary users, and forged user metadata.
3. **Unrestricted database access** — `schema.sql` granted unrestricted progress and financial access, including anonymous ownership exemptions. A legacy security-definer wallet function accepted caller-selected IDs and amounts. Owner-scoped policies and RPC privilege revocation are provided in `supabase/migrations/20261115_security_boundaries.sql`. These protections require deployment of the migration and review of any additional live policies.

## High findings addressed

4. **Universal authentication overrides and client-generated verification** — student signup/verification now uses Supabase-issued verification and sessions. Universal codes and local-session auto-login fallback were removed. Administrator authentication is checked before dashboard loading.
5. **CORS and private response caching** — arbitrary origins were reflected with credentials; general API GET responses and streams were publicly cacheable. The outer ASGI policy enforces exact allowed origins and private/no-store responses. Edge proxies no longer cache media slices ahead of authorization. Native video playback uses expiring path-bound tickets.
6. **Wallet races and invalid amounts** — debit, topup and reward paths could separate checks from updates. The SQLite ledger uses immediate transactions and records balance changes with ledger entries. Retry keys prevent duplicate debits; topup and bounty tests exercise simultaneous requests. Negative, zero and nonfinite debit inputs are rejected. User-editable Auth metadata is excluded from balance recovery.
7. **Raw diagram/print HTML** — external diagram SVG and generated notes reached raw rendering sinks. DOMPurify now sanitizes SVG and print HTML. Tests verify removal of scripts, event attributes, foreign HTML, and JavaScript URLs.
8. **Vulnerable dependencies** — JavaScript dependencies were patched, Vite upgraded, and vulnerable transitive versions overridden. FastAPI/Pydantic and vulnerable Python dependencies were updated; the unused Mistral SDK and its vulnerable PyArrow dependency were removed. Root/admin npm audits and the resolved Python 3.11 environment report no known vulnerabilities at validation time.

## Bugs and maintenance

Production module imports replace duplicated test implementations. Duplicate method/path registrations were removed; the shadowed GFG question route now has a distinct path. SQLite context-managed connections close reliably. Resource downloads reject failed HTTP responses rather than saving error JSON. Usage-cache telemetry no longer sends a duplicate debit, and wallet synchronization reads the backend instead of user-editable Auth metadata. Vercel remains supported for administration; configurable backend adapters replace embedded origin rewrites.

## Remaining risks and verification limits

- Credential revocation, policy migration, administrator provisioning, and deployment are outstanding operational steps; see `SECURITY.md`.
- Some legacy UI charging and purchase-entitlement decisions remain client-oriented. Signed-in users can access provider/media routes without a complete server-enforced purchase workflow. This is a remaining business-logic risk, not resolved by token validation or ledger atomicity.
- In-memory rate limits do not aggregate across instances. Apply gateway quotas and provider spending caps.
- Tests isolate network providers and storage. They do not prove live email delivery, deployed RLS behavior, payment settlement, production account recovery, or real Telegram streaming. Startup uses a deprecated FastAPI event hook; builds retain large-bundle warnings.

## Evidence anchors

- `backend/security.py:12` ? `class SecurityMiddleware`.
- `backend/secure_routes.py:48` ? `async def supabase_proxy`.
- `backend/wallet_ledger.py:9` ? `def change_balance`.
- `src/lib/auth.ts:179` ? `export async function verifyEmailOtp`.
- `backend/main.py:3545` ? `async def get_interview_session_route`.
- `supabase/migrations/20261115_security_boundaries.sql:5` ? `CREATE POLICY`.

## Validation results

- 14 frontend tests passed using production module imports, including credential routing, output comparison, interview transitions, malicious SVG/HTML, and usage-cache double-debit prevention.
- 18 Python tests passed in an isolated Python 3.11 environment with the actual backend requirements installed. Coverage includes real ASGI route smoke tests, owner/role rejection, code-backup round trips and failed persistence, provider streaming with server-held credentials, concurrent debits/topups/bounties, and media tickets.
- Student and admin production builds passed. Large-chunk warnings remain; backend startup uses a deprecated event hook.
- Root and admin npm audits: zero known vulnerabilities. Audit of the fully resolved Python environment: zero known vulnerabilities.
- Source/built-artifact secret scan: zero findings. Git diff whitespace check passed. Session and scratch paths are no longer tracked; local copies remain.
- AGENTS.md was checked to contain the complete current context.md body, including the new security section.

Final regression review: no additional confirmed defects were identified in the exercised changes after correcting stale imports, stream forwarding, code-key consistency, ticket-refresh playback, and duplicate debit telemetry. This does not remove the remaining operational and business-logic risks listed above. No production services were deployed or modified.
