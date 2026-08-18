# SilverCare Connect A3 - foundation snapshot

This first cumulative snapshot starts the A3 upgrade from A2. It establishes the split Vue architecture, Firebase-compatible authentication adapter, signed server sessions, server-side role checks, REST API boundaries and deployment configuration. Later snapshots refine and demonstrate the D/E/F surfaces.

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
