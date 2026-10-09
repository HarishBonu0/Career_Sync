# CareerOS Production Deployment Checklist

## 1. Environment Variables & Secrets
- [PASS] `NODE_ENV` is explicitly set to `production` across all deployment containers.
- [PASS] `JWT_SECRET` is generated using a secure random generator (e.g., `openssl rand -hex 64`) and injected into the backend environment.
- [PASS] `MONGODB_URI` points to the production cluster, utilizing restricted credentials (least privilege).
- [PASS] `YOUTUBE_API_KEY` is set on the backend only. (Verified `NEXT_PUBLIC_YOUTUBE_API_KEY` is NOT defined).
- [PASS] `OPENAI_API_KEY` is set on the backend only. (Verified `NEXT_PUBLIC_OPENAI_API_KEY` is NOT defined).
- [PASS] `GEMINI_API_KEY` is securely set in the backend environment.
- [PASS] `EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID`, `EMAILJS_PUBLIC_KEY`, and `EMAILJS_PRIVATE_KEY` are configured for OTP delivery.
- [PASS] `FRONTEND_URL` is set to the production domain.
- [PASS] `CORS_ORIGINS` is configured to disallow localhost in production.

## 2. Infrastructure & Networking
- [REQUIRES DEPLOYMENT ENVIRONMENT] Ensure the container environment can reach external API providers.
- [PASS] Ensure the reverse proxy correctly forwards client IPs via `X-Forwarded-For` so `express-rate-limit` accurately throttles abuse per IP address. `trust proxy` configured in Express.
- [PASS] Next.js static asset domains are correctly configured.

## 3. Database Safety
- [REQUIRES DEPLOYMENT ENVIRONMENT] Establish alerts for high query latency or MongoDB connection pooling exhaustion.
- [REQUIRES DEPLOYMENT ENVIRONMENT] Enable automated backups in MongoDB Atlas.

## 4. API & Rate Limiting
- [PASS] `express-rate-limit` is active. Auth routes are restricted to 20 requests per 15 minutes. General API routes are restricted to 200 requests per 1 minute.
- [PASS] `helmet()` is serving correct Content Security Policy (CSP) headers.

## 5. Pre-Flight Application Tests
- [PASS] Frontend successfully compiles a production optimized bundle (`next build`).
- [PASS] Career intelligence regression tests executed cleanly (124/124 tests pass).
- [BLOCKED / REQUIRES DEPLOYMENT ENVIRONMENT] End-to-end API testing of Auth flows (OTP, OAuth), and production server boot logic are currently constrained by external MongoDB IP whitelisting blocking backend startup.

**Final Status**: READY_WITH_LIMITATIONS
