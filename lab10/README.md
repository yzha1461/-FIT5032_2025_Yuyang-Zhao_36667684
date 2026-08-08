# FIT5032 Lab 10 - NoMash Library with Weather

This is the complete library application from earlier FIT5032 labs, extended with the Lab 10 weather feature. It is intentionally a full Vue project rather than three isolated `.vue` files.

## Library features retained

- Firebase registration, sign-in and sign-out
- Firestore book creation, query, update and deletion
- Existing library pages and routing

## Lab 10 feature

- Route: `/WeatherCheck`
- Browser location weather lookup and city search
- Uses OpenWeather when `VITE_OPENWEATHER_API_KEY` is configured
- Uses Open-Meteo as a no-key fallback for local demonstration

## Run locally

```bash
npm install
npm run dev
```

