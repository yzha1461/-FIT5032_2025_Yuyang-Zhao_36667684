# SilverCare Connect A3 - advanced integration snapshot

This second cumulative snapshot extends the foundation with the D/E integration surfaces: external-auth adapter wiring, validated email attachments, reusable searchable tables, Leaflet map search and route summaries, export helpers, and Firebase deployment configuration.

## Run locally

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

Open `http://localhost:5173`. The local demo uses the signed server session fallback when Firebase variables are empty.

Demo accounts:

- Member: `member@silvercare.test` / `Care123!Secure`
- Staff: `staff@silvercare.test` / `Staff123!Secure`

## Implemented requirements

- D.1 Firebase Auth adapter with a signed server session fallback for local demonstration.
- D.2 validated email composition with an attachment payload and Resend/SendGrid integration point.
- D.3 reusable interactive tables with per-column search, sorting and ten-row pagination.
- D.4 Firebase Hosting configuration and reproducible production build.
- E.1 Firebase Cloud Functions plus a local Express API with server-side role checks.
- E.2 Leaflet/OpenStreetMap place search, current location and OSRM route summary.
- E.3 keyboard focus, skip link, text alternatives, high contrast and reduced-motion support.
- E.4 CSV and PDF export for requests and members.
- F.1 four innovations: conflict-aware calendar, bulk email, REST API routes and interactive admin chart/dashboard.

For production, set Firebase, JWT and email secrets from `.env.example`, deploy the functions, and configure the public hosting URL in the A3 report.
