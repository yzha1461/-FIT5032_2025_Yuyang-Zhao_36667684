# SilverCare Connect A3 - final snapshot

This is the final cumulative A3 snapshot. It extends the A2 member/staff experience with a split Vue architecture, a server API, Firebase-compatible authentication, server-side role checks, and D/E/F business requirements.

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
- D.2 validated email composition with an attachment payload and live Resend delivery through the deployed API (secret stored in Firebase Secret Manager).
- D.3 reusable interactive tables with per-column search, sorting and ten-row pagination; members can submit new service requests from the support hub.
- D.4 Firebase Hosting configuration and reproducible production build.
- E.1 Firebase Cloud Functions plus a local Express API with server-side role checks.
- E.2 Leaflet/OpenStreetMap place search, current location and OSRM route summary.
- E.3 keyboard focus, skip link, text alternatives, high contrast and reduced-motion support.
- E.4 CSV and PDF export for requests and members.
- F.1 four innovations: conflict-aware calendar, bulk email, REST API routes and interactive admin chart/dashboard.

Confirmed deployment: Firebase Hosting is live at `https://yuyang-zhao.web.app` and the full Express API is deployed as `api` in `australia-southeast1`. Resend and JWT signing are configured through Firebase Secret Manager; a live attachment email test returned `accepted: true, delivered: true`, and the old local fallback key is rejected by the public API.
