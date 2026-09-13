# Pyramidth CRM Frontend

Next.js App Router frontend for the Pyramidth Sales CRM. The browser calls the same-origin BFF under `/api`; the BFF forwards requests and cookies to Laravel, so the frontend never stores authentication tokens or provider secrets.

## Run locally

```bash
npm install
npm run dev
```

Set the Laravel backend URL in `lib/bff-proxy.ts` or move it to a server-only environment variable before deploying. The app includes a responsive authenticated workspace with dashboard metrics, pipeline, leads, clients, shipments, follow-ups, real lead creation, and lead conversion.

## Validation

```bash
npm run build
```

The build uses TypeScript checking and Next production compilation. API authorization and business rules are enforced by Laravel, not by client-side navigation.
