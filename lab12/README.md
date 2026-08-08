# FIT5032 Lab 12 - Library CI/CD Project

This directory contains the complete NoMash Library Vue project inherited from earlier FIT5032 labs, including the Lab 10 weather and Lab 11 book API pages.

Lab 12 adds CI/CD through GitHub Actions. The executable workflow is stored at `.github/workflows/deploy-lab12.yml`, as required by GitHub. A matching copy is included here as `deploy.yml` for Lab 12 source evidence.

## Run locally

```bash
npm install
npm run dev
```

## CI/CD behaviour

Any push that changes `lab12/**` triggers the Lab 12 workflow. It installs dependencies, builds the Vue application, creates a GitHub Pages single-page-app fallback, then deploys the `dist` folder to the `gh-pages` branch.
