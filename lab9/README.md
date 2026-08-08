# FIT5032 Lab 9 - Library Cloud Functions

This is the complete library application inherited from the earlier FIT5032 labs, extended for Lab 9.

## Existing library functionality

- Firebase registration, sign-in and sign-out
- Firestore book creation, query, update and deletion
- Existing library pages, routing and components

## Lab 9 additions

- `functions/index.js` exports `countBooks`, which counts documents in the Firestore `books` collection.
- `functions/index.js` exports `bookInsights`, which returns a custom book inventory report.
- `/GetBookCount` calls the deployed `countBooks` endpoint with Axios.
- `/BookInsights` displays the `bookInsights` response in a custom report view.

## Run locally

```bash
npm install
npm run dev
```

## Deploy functions

Install the Firebase CLI, sign in to the `yuyang-zhao` Firebase project, then run:

```bash
cd functions
npm install
firebase deploy --only functions
```

Copy the two deployed HTTPS endpoint URLs into `.env.local` using the variable names in `.env.example`, then rebuild the Vue project. Do not commit `.env.local` or any API credentials.
