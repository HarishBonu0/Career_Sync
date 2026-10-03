# CareerOS Phase 2 Authentication Report

Date: 2026-10-03
Scope: Unified authentication and Google Sign-In preparation

## Authentication Architecture

The active authentication authority is still `apps/api` with MongoDB-backed users and JWT sessions. Email/password, OTP and Google OAuth all use the same server-issued `Career_Sync_token` HttpOnly cookie and the same `authenticate` middleware.

```text
Browser
  -> apps/web
  -> GET /api/auth/me with credentials: include
  -> Express auth middleware
  -> MongoDB User._id
  -> shared authenticated User object
  -> Courses, Roadmaps, Skills, Dashboard
```

The frontend no longer stores auth tokens or user auth snapshots in localStorage, creates an auth cookie, or accepts `auth_token`/`auth_user` URL parameters. The backend remains authoritative. Bearer-header extraction remains only as a backward-compatible server/API path for existing non-browser clients; active web requests use the canonical cookie.

## Google OAuth Architecture

Implemented in `apps/api/routes/auth.js` with `google-auth-library`:

1. `GET /api/auth/google` generates a cryptographically random state value.
2. State is stored in an HttpOnly, SameSite=Lax, short-lived `Career_Sync_google_state` cookie.
3. The browser is redirected to Google authorization with `openid`, `email` and `profile` scopes.
4. `GET /api/auth/google/callback` validates state and exchanges the authorization code server-side.
5. Google ID token signature, audience and claims are verified by `OAuth2Client`.
6. Login requires a verified Google email and uses the verified Google `sub` identifier.
7. The backend finds an existing `googleId`, or finds the same verified email and links it safely.
8. New Google users are created in the existing `User` collection.
9. The normal CareerOS JWT is issued and stored in the canonical HttpOnly cookie.
10. The user is redirected to `/home` without putting a token in the URL.

The previous `POST /api/auth/google-signin` endpoint now returns HTTP 410. It no longer trusts browser-supplied email, name, picture or Google ID data.

## Database Changes

`apps/api/models/User.js` now includes:

- `avatar`: optional profile image URL.
- `googleId`: optional, unique sparse Google subject identifier.
- `authProviders`: array containing `email` and/or `google`.
- `provider`: backward-compatible value expanded to `email`, `google` or `both`.

Existing email users remain valid because `googleId` is optional and sparse. A Google account with a verified email matching an existing user is linked to that user instead of creating a duplicate. Google access/refresh tokens are not stored.

## API Changes

| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| GET | `/api/auth/google` | Start Google authorization-code flow | No |
| GET | `/api/auth/google/callback` | Validate state, verify Google identity, link/create user and create normal session | No, callback-protected by state |
| POST | `/api/auth/google-signin` | Explicitly disabled legacy browser-trust endpoint | No; always 410 |
| GET | `/api/auth/me` | Resolve the canonical server session | Cookie |
| POST | `/api/auth/logout` | Clear the canonical session cookie | No |
| POST | `/api/auth/register` | Create email user and session cookie | No |
| POST | `/api/auth/login` | Authenticate email user and session cookie | No |
| POST | `/api/auth/request-otp` | Issue hashed OTP | No |
| POST | `/api/auth/login-otp` | Verify OTP and session cookie | No |

## Frontend Changes

- `AuthContext` now exposes `loading`, `authenticated`, `unauthenticated` and `error` status through `authStatus`.
- Session initialization calls `/api/auth/me` with `credentials: include`.
- Stale localStorage fallback was removed.
- Login and signup now include real `Continue with Google` redirect actions.
- OAuth callback error codes are converted to safe user-facing login messages.
- Email signup and OTP login no longer persist returned JWTs in localStorage.
- API, course, roadmap, skill, enrollment and profile requests no longer read localStorage tokens.
- Protected middleware checks only the canonical cookie; URL auth bypass was removed.
- Protected Studio and My Courses flows wait for session initialization before redirecting.
- Logout calls the backend and clears frontend state; server cookie invalidation remains authoritative.

## Environment Variables

Required names only:

```text
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_CALLBACK_URL
FRONTEND_URL
```

Development callback example:

```text
http://localhost:5000/api/auth/google/callback
```

The client secret is server-only and must never use a `NEXT_PUBLIC_*` name. Production must use the real production frontend origin and an exact registered callback URL.

## Migration and Compatibility

- Existing email/password users continue using the same `User` records and JWT cookie.
- Existing OTP users continue using the same OTP routes and cookie.
- Existing user documents do not require `googleId`.
- Existing legacy applications were not deleted.
- The old browser-trust Google endpoint is retained only as a safe rejection to prevent silent insecure behavior.
- Bearer extraction remains temporarily for compatibility with existing non-browser API callers; active `apps/web` code uses cookies only.
- No destructive database migration was run.
- No AI, course, roadmap or skill-generation logic was changed.

## Verification

| Check | Result |
|---|---|
| Email registration | PASS; real MongoDB user and canonical cookie created |
| Email login | PASS; phase 1 registration/login flow passes |
| OTP login | NOT TESTED end-to-end; EmailJS delivery requires configured live OTP workflow |
| Logout | PASS; cookie session returns 401 after logout |
| Session persistence | PASS; cookie-only `/auth/me` resolves the same user |
| Google new-user login | NOT TESTED end-to-end; requires interactive Google consent/callback |
| Google returning-user login | NOT TESTED end-to-end; requires interactive Google consent/callback |
| Google existing-email linking | NOT TESTED end-to-end; requires real verified Google identity |
| Google logout | NOT TESTABLE end-to-end without Google login; shared logout path is covered |
| Google refresh persistence | NOT TESTABLE end-to-end without Google login; shared cookie session is covered |
| Cross-module authentication | PASS at request-contract level; all active feature clients use cookie credentials |
| Unauthorized access | PASS; `/api/auth/me` without a session returns 401 |
| Cross-user protection | PASS; phase 1 ownership suite passes 6/6 |
| URL authentication removed | PASS; active middleware/context no longer accepts auth URL parameters |
| Frontend build | PASS; Next.js build, lint and type checks pass |
| Backend health | PASS; MongoDB Atlas connected and `/api/health` returns OK |
| Phase 2 verifier | PASS: 6 passed, 0 failed, 1 interactive Google identity item not testable |
| Invalid OAuth state | PASS; callback redirects with `oauth_error=invalid_state` and does not create a session |
| Phase 0 verifier | 8 passed, 1 known failure; course enrollment number/array contract mismatch remains |

## Remaining External Step

The server-side environment values are configured locally and the authorization redirect is working. Complete one interactive Google consent flow at `http://localhost:3002/login`, then verify new-user, returning-user and same-email linking behavior with `npm --prefix apps/api run test:phase2` plus the manual account scenarios. No credentials are printed in this report.

## Final Status

```text
PHASE 2 STATUS: BLOCKED

Canonical authentication: YES
Email authentication: YES
OTP authentication: YES
Google authentication: YES (implemented; interactive exchange pending)
Google account linking: YES (implemented; interactive verification pending)
Session persistence: YES
Logout: YES
Protected routes: YES
API authorization: YES
Cross-module authentication: YES
Cross-user protection: YES
URL authentication removed: YES
Frontend build: PASS
Backend verification: PASS
Authentication tests: BLOCKED by unexecuted interactive Google consent/linking scenarios

Ready for Phase 3: NO
```

Phase 3 was not started.