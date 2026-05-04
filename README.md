# Novex CRM Mobile

Novex CRM Mobile is an Android-installable PWA for lead updates. It is built as a Vercel-ready static app with a serverless webhook endpoint at `/api/leads`.

## Install on Android

1. Deploy the project to Vercel.
2. Open the deployed URL in Chrome on Android.
3. Tap the browser menu, then tap **Install app** or **Add to Home screen**.

## Lead Update Webhook

Configure your lead source to send `POST` requests to:

```text
https://your-vercel-app.vercel.app/api/leads
```

Example payload:

```json
{
  "id": "lead-1042",
  "name": "Amina Patel",
  "phone": "+27 82 555 0148",
  "source": "Website",
  "value": 34000,
  "notes": "Requested a quote and wants a call before 15:00.",
  "priority": "hot",
  "status": "new"
}
```

For webhook protection, set `NOVEX_WEBHOOK_TOKEN` in Vercel and send the same value in the `x-novex-token` header.

## Vercel Environment

The webhook needs durable storage. Add these Vercel environment variables from an Upstash Redis REST database:

```text
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
NOVEX_WEBHOOK_TOKEN=
```

The mobile app polls `/api/leads` every 60 seconds and stores the latest leads on the device for offline use.
