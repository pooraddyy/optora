# Optora API Guide

Optora is a backend-only email verification service. Call it from a trusted server, never directly from an untrusted browser or mobile client. The API issues a verification request, delivers an email, and allows your backend to confirm the resulting state.

## Base URL and content type

Use the public URL of your Optora deployment as the base URL. All write requests use JSON with `Content-Type: application/json`.

| Item | Value |
| --- | --- |
| Base URL | `https://your-optora-domain` |
| Request encoding | JSON |
| Code expiry | `OTP_VALIDITY_PERIOD_MINUTES`, default `5` |
| Verification modes | Numeric/alphanumeric code or signed magic link |

## Generate and deliver a code

`POST /api/otp/generate` creates a verification request and sends the OTP to the target email address.

```json
{
  "email": "person@example.com",
  "type": "numeric",
  "organization": "Acme",
  "subject": "Your Acme verification code"
}
```

| Field | Required | Notes |
| --- | --- | --- |
| `email` | Yes | Recipient address. |
| `type` | No | `numeric`, `alphanumeric`, or `alphabet`; default is `numeric`. |
| `organization` | No | Display name used in the email. |
| `subject` | No | Email subject. |

```json
{
  "message": "Verification code sent to your email",
  "mode": "code",
  "requestId": "86d5…",
  "validityMinutes": 5
}
```

## Verify a code

`POST /api/otp/verify` marks an active request as verified when the submitted email and OTP match.

```json
{
  "email": "person@example.com",
  "otp": "482917"
}
```

```json
{
  "message": "Email verified successfully",
  "verified": true
}
```

## Send and resolve a magic link

`POST /api/otp/send-link` sends a signed verification link. Optionally provide a public HTTPS `webhookUrl`; Optora posts an `email.verified` event to that URL after the recipient opens a valid link.

```json
{
  "email": "person@example.com",
  "organization": "Acme",
  "subject": "Confirm your Acme email",
  "webhookUrl": "https://api.acme.example/webhooks/optora"
}
```

The email link invokes `GET /api/otp/verify-link?token=…`. Its browser response is a branded confirmation page. A successful webhook payload has the following shape:

```json
{
  "event": "email.verified",
  "email": "person@example.com",
  "requestId": "86d5…",
  "verifiedAt": "2026-08-21T00:00:00.000Z"
}
```

## Check status

`GET /api/otp/status/:requestId` lets a trusted backend poll a request without exposing verification records to the client.

```json
{
  "found": true,
  "verified": false,
  "expired": false
}
```

## Error handling

Optora returns a JSON `{ "error": "…" }` body for API errors. Treat `400` responses as request, verification, or delivery failures; retry only when the user can safely take a new action. Rate limits and blocked requests should be surfaced as a calm retry-later state in your application.

## Operational notes

Verification records are short-lived and cleaned by MongoDB TTL. Existing active records for an email may be reused until they expire. Keep every call server-side, set an explicit `APP_BASE_URL` in production, and validate webhook signatures or allowlists in your receiving service according to your own security requirements.
