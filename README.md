# Optora

> **Email verification as a small, dependable backend capability.** Optora is a self-hosted API for code-based and magic-link email verification, built with Express, MongoDB, and Nodemailer.

The repository contains two deployable pieces that work together: a polished Vite frontend at the site root and a protected OTP API under `/api/*`. The frontend explains the product; the backend performs verification work.

## What Optora handles

| Capability | What it gives your application |
| --- | --- |
| Code verification | A short-lived OTP delivered by email and confirmed from your backend. |
| Magic-link verification | A signed email link with a branded success or error response. |
| Status visibility | A server-side status endpoint for request lifecycle checks. |
| Webhook callbacks | An optional `email.verified` event after a magic link resolves. |
| Guardrails | Rate limiting, blocklist support, keyword filtering, configurable domain policy, and MongoDB TTL cleanup. |

For detailed endpoint contracts and examples, read [the API guide](docs/API.md).

## Architecture

```text
Your trusted backend
        │
        ├── POST /api/otp/generate ──► Optora ──► Email code
        ├── POST /api/otp/send-link ─► Optora ──► Magic link
        └── POST /api/otp/verify ────► Optora ──► Verified state

Browser visitors ─────────────────────► Optora frontend
Magic-link recipients ───────────────► /api/otp/verify-link
```

> **Important:** The API is intended for server-to-server use. Do not let an untrusted browser call OTP generation or verification endpoints directly.

## Quick start

### Prerequisites

You need Node.js 18 or later, a MongoDB database, and a Gmail account with an App Password. A production deployment also needs a public base URL for magic links.

### Install dependencies

```bash
git clone https://github.com/pooraddyy/optora.git
cd optora
npm ci
npm ci --prefix web
```

### Configure the service

Create `.env` in the repository root. Never commit it.

```env
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/optora
GMAIL_USER=you@example.com
GMAIL_PASS=your_gmail_app_password
APP_BASE_URL=http://localhost:5000

# Optional tuning
OTP_VALIDITY_PERIOD_MINUTES=5
OTP_SIZE=6
RATE_LIMIT_MAX_REQUESTS=5
RATE_LIMIT_WINDOW_MINUTES=15
ALLOWED_DOMAINS=
BLOCK_KEYWORDS_RULES=
```

| Variable | Required | Purpose |
| --- | --- | --- |
| `MONGODB_URI` | Yes | MongoDB connection string for OTP records and TTL cleanup. |
| `GMAIL_USER` | Yes | Gmail address used for outgoing messages. |
| `GMAIL_PASS` | Yes | Gmail App Password, not the account password. |
| `APP_BASE_URL` | Recommended | Public URL used when Optora constructs magic links. |
| `OTP_VALIDITY_PERIOD_MINUTES` | No | Validity window; defaults to `5`. |
| `OTP_SIZE` | No | Number of generated OTP characters; defaults to `6`. |
| `RATE_LIMIT_MAX_REQUESTS` | No | Maximum requests per configured window; defaults to `5`. |
| `RATE_LIMIT_WINDOW_MINUTES` | No | Rate-limit interval; defaults to `15`. |
| `ALLOWED_DOMAINS` | No | Comma-separated email domain allowlist. |
| `BLOCK_KEYWORDS_RULES` | No | Comma-separated request-body keyword filter. |

### Run locally

Run the backend and frontend in separate terminals during development.

```bash
# Terminal 1 — OTP API and local production-style static frontend
npm run dev

# Terminal 2 — Vite frontend with hot reload
npm run dev --prefix web
```

The backend starts on `http://localhost:5000` by default. The frontend development server prints its own local URL, normally `http://localhost:3000`.

## Integrate from your backend

Use your own server as the caller. This example creates and delivers a numeric code:

```ts
const response = await fetch("https://your-optora-domain/api/otp/generate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "person@example.com",
    organization: "Acme",
    subject: "Your Acme verification code",
  }),
});

if (!response.ok) throw new Error((await response.json()).error);

const { requestId, validityMinutes } = await response.json();
```

Then submit the code from your application to your own backend, and let that backend call `POST /api/otp/verify`. This keeps verification credentials, rate limits, and anti-abuse controls out of the public client.

## Production build

```bash
npm run build:deploy
```

The command compiles the backend and builds the Vite site into `public/`. The production Express app serves the redesigned frontend for browser routes and preserves OTP operations under `/api/*`.

## Deploy on Vercel

The repository includes a production `vercel.json` that performs the following steps:

| Deployment concern | Repository configuration |
| --- | --- |
| Dependency install | `npm ci && npm ci --prefix web` |
| Build | `npm run build:deploy` |
| Static output | `public/` |
| API routing | `/api/*` stays on the Express API function |
| Frontend routing | All non-API routes resolve to the Vite app entry point |

Connect the repository to Vercel, set the required environment variables, and deploy the latest `main` commit. Do not retain an old custom Vercel Install Command that uses pnpm; this repository uses npm lockfiles for both the root API and the `web/` frontend.

## Verification and operations

Before a production launch, check the following items.

| Check | Expected result |
| --- | --- |
| `GET /` | The Optora product site loads. |
| `GET /api/not-a-real-endpoint` | Returns JSON API 404, not the frontend page. |
| OTP generation | An email arrives from the configured Gmail account. |
| Magic link | The recipient sees a branded confirmation page. |
| Webhook | Your receiving endpoint logs the `email.verified` payload. |

## Project scripts

| Command | Use |
| --- | --- |
| `npm run dev` | Start the TypeScript backend in watch mode. |
| `npm run build` | Compile the backend into `dist/`. |
| `npm run build:web` | Build the Vite frontend into `public/`. |
| `npm run build:deploy` | Build backend and frontend together for production. |
| `npm run dev --prefix web` | Start the frontend development server. |

## License

[MIT](LICENSE). You may use, modify, and deploy Optora under the license terms.

