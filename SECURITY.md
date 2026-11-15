# Security Configuration and Release Notes

## Required configuration

Student builds require the public Supabase URL and anon/publishable key. Set `VITE_BACKEND_URL` and `VITE_STUDENT_URL` for the deployment. Only public configuration belongs in browser environment variables. Copy the placeholder examples before local development; never copy server secrets into browser configuration.

The backend requires `SUPABASE_URL` and `SUPABASE_ANON_KEY` to validate sessions. Set server-only `SUPABASE_SERVICE_ROLE_KEY` for administration. Provision administrators through a trusted Supabase administrative process with `app_metadata.role = "admin"`; user metadata and email substrings do not grant privileges. The admin portal signs in through Supabase email OTP before loading the dashboard.

Set `ALLOWED_ORIGINS` to a comma-separated list of exact student and admin origins, including local origins when developing. Generate `MEDIA_SIGNING_KEY` with at least 32 random characters. Video tickets expire after 30 minutes and are bound to one media path. Treat ticket URLs as temporary credentials.

Configure AI, Telegram, R2, and Redis credentials only on the backend. Local Redis helpers now cache in browser memory; durable writes remain server operations. Local backend `.env` loading in the career module is opt-in with `LOAD_LOCAL_ENV=1`; prefer `uvicorn main:app --env-file .env --reload` from `backend/`.

## Deployment sequence

1. Revoke and replace exposed Telegram sessions/bot tokens, R2 credentials, Redis tokens, API keys, and any previously browser-exposed Supabase service-role key. Removing literals or files does not revoke credentials or erase Git history. Session and scratch files have been removed from Git's index, preserving local copies.
2. Back up SQLite and Supabase. Apply `supabase/migrations/20261115_security_boundaries.sql` to the existing database. Review other policies in the deployed database: an additional permissive policy can defeat an owner policy. The migration is supplied, not applied automatically.
3. Preserve the existing SQLite database location or explicitly migrate it before setting `SQLITE_DB_PATH`. Keep it on persistent storage. R2 wallet backups remain server-controlled; user-editable Auth metadata is no longer trusted for balance recovery. Reconcile legacy balances before releasing financial changes.
4. Configure backend secrets, allowed origins, and administrator roles. Configure Cloudflare Pages `RENDER_BACKEND_URL`. Vercel remains in use for the admin portal: set server-side `BACKEND_URL` and public build variables. Root and admin-directory Vercel configurations support their respective deployment roots.
5. User-code backups now use hashed normalized-email namespaces and validated language names. Migrate existing R2 user-code keys under administrator control if historical backups must be restored; do not expose ambiguous legacy email aliases.
6. Build and deploy backend and clients together. Confirm sign-in, admin permissions, paid operations, invitations, and byte-range streaming in staging. Rotate the media signing key to invalidate existing video tickets.

## Validation

Run `npm test`, `npm run test:security`, `npm run build`, and `npm run build:admin`. Run backend tests in Python 3.11 with `backend/requirements.txt` installed; full-app tests are skipped when backend dependencies are absent. Run `python scripts/check_secrets.py` after building. It checks tracked/unignored source and built assets without printing credential values. This scanner complements provider credential revocation and a dedicated history scan.

Use `npm audit` at the root and in `admin-portal/`. Audit the resolved Python environment, not only direct requirement pins. Preserve lockfiles. The `image-size` override affects optional React Native tooling pulled in by AlaSQL; browser SQL builds are validated, React Native development is outside this repository's deployment targets.

## Operational limits

On the current single-instance Render free service, `LEDGER_SNAPSHOT_KEY` enables restoration from a private R2 snapshot at startup and persistence after successful financial operations. `BILLING_SNAPSHOT_KEY` supports a one-release import of the pre-release billing backup. Clear the bootstrap setting after verifying the durable ledger. Do not scale separate SQLite instances against a shared snapshot; use a transactional shared database before scaling. Failed snapshot uploads return a server error and require operational attention.

Keep Auth user metadata small: billing transactions and wallet caches must stay in the ledger and private backups, not JWT claims. Historical oversized metadata can make otherwise valid sign-ins fail HTTP header limits. Back it up before removing financial fields. Legacy wallet imports must also reconcile reused internal IDs by account email; a durable restore must fail if any backed-up account is omitted.

Request limits currently apply per process and per verified account, with a separate invitation-verification IP limit. Configure gateway-wide limits for multiple workers/instances and a trusted proxy IP policy before relying on IP quotas. Configure provider spending caps.

The legacy frontend still estimates some charges locally. Authentication, balances and financial mutations are server-protected, but end-to-end pricing enforcement and video purchase entitlement are separate concerns: media tickets currently prove a signed-in session, not purchase ownership. Do not represent those controls as complete payment enforcement. Live Supabase policies, provider revocation, and staging workflows require operational verification.
