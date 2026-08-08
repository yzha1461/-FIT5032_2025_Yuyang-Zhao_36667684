<template>
  <div class="container weather-page">
    <section class="hero weather-hero">
      <p class="eyebrow">FIT5032 Assessed Lab 10</p>
      <h1>Weather App</h1>
      <p>Search a city or allow location access to view current conditions in Celsius.</p>
    </section>

    <section class="weather-panel" aria-labelledby="weather-heading">
      <div class="panel-heading">
        <div>
          <span class="section-label">External API</span>
          <h2 id="weather-heading">Current weather</h2>
        </div>
        <span class="data-source">{{ dataSource }}</span>
      </div>

      <form class="search-row" @submit.prevent="searchByCity">
        <label class="visually-hidden" for="city-search">City name</label>
        <input
          id="city-search"
          v-model.trim="city"
          class="search-input"
          type="search"
          placeholder="Try Clayton, AU"
          autocomplete="address-level2"
        >
        <button class="search-button" type="submit" :disabled="loading">
          {{ loading ? 'Searching...' : 'Search' }}
        </button>
        <button class="location-button" type="button" :disabled="loading" @click="fetchCurrentLocationWeather">
          Use my location
        </button>
      </form>

      <p v-if="errorMessage" class="message error" role="alert">{{ errorMessage }}</p>
      <p v-if="loading" class="message loading" role="status">Loading weather data...</p>

      <article v-if="weatherData" class="weather-card">
        <div class="weather-card-main">
          <div>
            <p class="weather-location">{{ weatherData.name }}<span v-if="weatherData.country">, {{ weatherData.country }}</span></p>
            <p class="weather-description">{{ weatherData.description }}</p>
          </div>
          <div class="temperature-block">
            <img v-if="weatherData.iconUrl" :src="weatherData.iconUrl" alt="Weather condition icon">
            <span v-else class="weather-emoji" aria-hidden="true">{{ weatherData.emoji }}</span>
            <strong>{{ weatherData.temperature }} °C</strong>
          </div>
        </div>
        <dl class="weather-facts">
          <div><dt>Feels like</dt><dd>{{ weatherData.feelsLike }} °C</dd></div>
          <div><dt>Humidity</dt><dd>{{ weatherData.humidity }}%</dd></div>
          <div><dt>Wind</dt><dd>{{ weatherData.wind }} m/s</dd></div>
        </dl>
      </article>
    </section>

    <p class="api-note">
      OpenWeather is used when <code>VITE_OPENWEATHER_API_KEY</code> is configured. The built-in Open-Meteo fallback keeps the page demonstrable before a personal key is added.
    </p>
  </div>
</template>

<script setup>
import axios from 'axios'
import { computed, onMounted, ref } from 'vue'

const city = ref('')
const weatherData = ref(null)
const loading = ref(false)
const errorMessage = ref('')
const source = ref('')
const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY || ''

const dataSource = computed(() => source.value || 'Ready')

const roundTemperature = (value) => Math.round(Number(value))

const weatherEmoji = (code) => {
  if (code === 0) return '☀️'
  if ([1, 2, 3].includes(code)) return '⛅'
  if ([45, 48].includes(code)) return '🌫️'
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return '🌧️'
  if ([71, 73, 75, 77, 85, 86].includes(code)) return '❄️'
  if ([95, 96, 99].includes(code)) return '⛈️'
  return '🌤️'
}

const weatherDescription = (code) => ({
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  71: 'Slight snow',
  73: 'Moderate snow',
  75: 'Heavy snow',
  80: 'Rain showers',
  81: 'Moderate rain showers',
  82: 'Violent rain showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with hail',
  99: 'Thunderstorm with heavy hail'
})[code] || 'Current conditions'

const setWeather = ({ name, country, temperature, feelsLike, humidity, wind, description, iconUrl = '', emoji = '🌤️' }, label) => {
  weatherData.value = {
    name,
    country,
    temperature: roundTemperature(temperature),
    feelsLike: roundTemperature(feelsLike),
    humidity: Math.round(Number(humidity)),
    wind: Number(wind).toFixed(1),
    description,
    iconUrl,
    emoji
  }
  source.value = label
}

const fetchOpenWeatherByCoordinates = async (latitude, longitude) => {
  const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
    params: { lat: latitude, lon: longitude, appid: apiKey, units: 'metric' }
  })
  const data = response.data
  setWeather({
    name: data.name,
    country: data.sys?.country,
    temperature: data.main.temp,
    feelsLike: data.main.feels_like,
    humidity: data.main.humidity,
    wind: data.wind?.speed || 0,
    description: data.weather?.[0]?.description || 'Current conditions',
    iconUrl: data.weather?.[0]?.icon ? `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png` : ''
  }, 'OpenWeather API')
}

const fetchOpenWeatherByCity = async (query) => {
  const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
    params: { q: query, appid: apiKey, units: 'metric' }
  })
  const data = response.data
  setWeather({
    name: data.name,
    country: data.sys?.country,
    temperature: data.main.temp,
    feelsLike: data.main.feels_like,
    humidity: data.main.humidity,
    wind: data.wind?.speed || 0,
    description: data.weather?.[0]?.description || 'Current conditions',
    iconUrl: data.weather?.[0]?.icon ? `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png` : ''
  }, 'OpenWeather API')
}

const fetchOpenMeteoByCoordinates = async (latitude, longitude, placeName = 'Current location', country = '') => {
  const response = await axios.get('https://api.open-meteo.com/v1/forecast', {
    params: {
      latitude,
      longitude,
      current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m',
      timezone: 'auto'
    }
  })
  const current = response.data.current
  setWeather({
    name: placeName,
    country,
    temperature: current.temperature_2m,
    feelsLike: current.apparent_temperature,
    humidity: current.relative_humidity_2m,
    wind: current.wind_speed_10m / 3.6,
    description: weatherDescription(current.weather_code),
    emoji: weatherEmoji(current.weather_code)
  }, 'Open-Meteo demo fallback')
}

const fetchOpenMeteoByCity = async (query) => {
  const [namePart, countryPart] = query.split(',')
  const geo = await axios.get('https://geocoding-api.open-meteo.com/v1/search', {
    params: {
      name: namePart.trim(),
      countryCode: countryPart?.trim().toUpperCase() || undefined,
      count: 1,
      language: 'en',
      format: 'json'
    }
  })
  const place = geo.data.results?.[0]
  if (!place) throw new Error('City not found. Try a city and country, such as Clayton, AU.')
  await fetchOpenMeteoByCoordinates(place.latitude, place.longitude, place.name, place.country_code)
}

const runRequest = async (request) => {
  loading.value = true
  errorMessage.value = ''
  try {
    await request()
  } catch (error) {
    const detail = error.response?.data?.message || error.message
    errorMessage.value = detail || 'Unable to load weather data.'
    weatherData.value = null
  } finally {
    loading.value = false
  }
}

const searchByCity = () => {
  if (!city.value) {
    errorMessage.value = 'Enter a city name first.'
    return
  }
  runRequest(() => apiKey ? fetchOpenWeatherByCity(city.value) : fetchOpenMeteoByCity(city.value))
}

const fetchCurrentLocationWeather = () => {
  if (!navigator.geolocation) {
    errorMessage.value = 'Location access is unavailable in this browser. Search by city instead.'
    return
  }
  runRequest(() => new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      try {
        if (apiKey) await fetchOpenWeatherByCoordinates(coords.latitude, coords.longitude)
        else await fetchOpenMeteoByCoordinates(coords.latitude, coords.longitude)
        resolve()
      } catch (error) {
        reject(error)
      }
    }, () => reject(new Error('Location permission was not granted. Search by city instead.')))
  }))
}

onMounted(() => {
  if (apiKey) fetchCurrentLocationWeather()
})

defineExpose({ searchByCity, fetchCurrentLocationWeather })
</script>

<style scoped>
.weather-page {
  max-width: 900px;
}

.weather-hero {
  background: #0f766e;
  border-color: #0f766e;
  color: #ffffff;
}

.weather-hero .eyebrow,
.weather-hero p:last-child {
  color: #d1fae5 !important;
}

.weather-panel {
  border: 1px solid #d7dde8;
  border-radius: 8px;
  background: #ffffff;
  padding: 22px;
}

.panel-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.panel-heading h2 {
  margin: 4px 0 0;
}

.section-label,
.data-source {
  color: #0f766e;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.data-source {
  border: 1px solid #99f6e4;
  border-radius: 999px;
  padding: 5px 8px;
  white-space: nowrap;
}

.search-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.search-input {
  flex: 1 1 260px;
  min-height: 42px;
  border: 1px solid #b6c0cf;
  border-radius: 5px;
  padding: 0 12px;
}

.search-button,
.location-button {
  min-height: 42px;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 700;
  padding: 0 14px;
}

.search-button {
  border: 1px solid #0f766e;
  background: #0f766e;
  color: #ffffff;
}

.location-button {
  border: 1px solid #7c3aed;
  background: #ffffff;
  color: #6d28d9;
}

.search-button:disabled,
.location-button:disabled {
  cursor: wait;
  opacity: 0.6;
}

.message {
  margin: 16px 0 0;
  border-radius: 5px;
  padding: 10px 12px;
}

.message.error {
  border: 1px solid #fda4af;
  background: #fff1f2;
  color: #9f1239;
}

.message.loading {
  border: 1px solid #bae6fd;
  background: #f0f9ff;
  color: #075985;
}

.weather-card {
  margin-top: 18px;
  border: 1px solid #99f6e4;
  border-radius: 8px;
  background: #f0fdfa;
  padding: 20px;
}

.weather-card-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
}

.weather-location {
  margin: 0;
  color: #134e4a;
  font-size: clamp(1.5rem, 5vw, 2.5rem);
  font-weight: 800;
}

.weather-description {
  margin: 6px 0 0;
  color: #4b5563;
  text-transform: capitalize;
}

.temperature-block {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #134e4a;
  white-space: nowrap;
}

.temperature-block img {
  width: 64px;
  height: 64px;
}

.temperature-block strong {
  font-size: 2rem;
}

.weather-emoji {
  font-size: 2.5rem;
}

.weather-facts {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin: 20px 0 0;
}

.weather-facts div {
  border-top: 1px solid #99f6e4;
  padding-top: 10px;
}

.weather-facts dt {
  color: #64748b;
  font-size: 0.82rem;
}

.weather-facts dd {
  margin: 3px 0 0;
  color: #134e4a;
  font-weight: 800;
}

.api-note {
  margin: 12px 0 0;
  color: #64748b;
  font-size: 0.86rem;
}

@media (max-width: 600px) {
  .weather-panel {
    padding: 16px;
  }

  .panel-heading,
  .weather-card-main {
    align-items: flex-start;
    flex-direction: column;
  }

  .weather-facts {
    grid-template-columns: 1fr;
  }
}
</style>
