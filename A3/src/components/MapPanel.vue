<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { LocateFixed, MapPin, Navigation, Search } from 'lucide-vue-next'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { apiGet } from '../services/api'

const mapElement = ref(null)
const query = ref('Monash University Clayton')
const results = ref([])
const message = ref('')
const routeSummary = ref('')
let map
let markers = []
let routeLine
let currentPosition = null

function clearMarkers() { markers.forEach((marker) => marker.remove()); markers = [] }
function addResultMarker(place) {
  const popup = document.createElement('span')
  popup.textContent = place.display_name.split(',')[0]
  const marker = L.marker([Number(place.lat), Number(place.lon)]).addTo(map).bindPopup(popup)
  markers.push(marker)
}

async function searchPlaces() {
  message.value = ''
  routeSummary.value = ''
  try {
    results.value = await apiGet(`/geocode?q=${encodeURIComponent(query.value)}`)
    clearMarkers()
    results.value.forEach(addResultMarker)
    if (results.value[0]) map.setView([Number(results.value[0].lat), Number(results.value[0].lon)], 13)
    if (!results.value.length) message.value = 'No places found. Try a suburb, clinic or community centre.'
  } catch (error) { message.value = error.message }
}

function locateUser() {
  if (!navigator.geolocation) { message.value = 'Location is not available in this browser.'; return }
  navigator.geolocation.getCurrentPosition((position) => {
    currentPosition = [position.coords.latitude, position.coords.longitude]
    map.setView(currentPosition, 14)
    L.circleMarker(currentPosition, { radius: 8, color: '#d75d47' }).addTo(map).bindPopup('Your approximate location').openPopup()
  }, () => { message.value = 'Location permission was not granted.' })
}

async function routeTo(place) {
  if (!currentPosition) { message.value = 'Choose Use my location before requesting a route.'; return }
  try {
    const route = await apiGet(`/route?fromLat=${currentPosition[0]}&fromLon=${currentPosition[1]}&toLat=${place.lat}&toLon=${place.lon}`)
    const leg = route.routes?.[0]
    if (!leg) throw new Error('No route was found.')
    routeSummary.value = `${(leg.distance / 1000).toFixed(1)} km - approximately ${Math.round(leg.duration / 60)} minutes by car.`
    if (routeLine) routeLine.remove()
    // OSRM returns geometry only when requested; the summary remains useful when no geometry is returned.
    routeLine = L.polyline([currentPosition, [Number(place.lat), Number(place.lon)]], { color: '#176b55', weight: 5 }).addTo(map)
    map.fitBounds(routeLine.getBounds(), { padding: [20, 20] })
  } catch (error) { message.value = error.message }
}

onMounted(async () => { await nextTick(); map = L.map(mapElement.value).setView([-37.91, 145.13], 11); L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors' }).addTo(map); searchPlaces() })
onBeforeUnmount(() => map?.remove())
</script>

<template>
  <section class="map-card" aria-labelledby="map-title">
    <div class="section-heading"><div><p class="eyebrow">E.2 geo location</p><h2 id="map-title">Find nearby support</h2><p class="muted-copy">Search a place, view it on the map, then request a route from your location.</p></div><button class="secondary-button" type="button" @click="locateUser"><LocateFixed :size="18" /> Use my location</button></div>
    <form class="map-search" @submit.prevent="searchPlaces"><label for="place-search">Search places</label><div><input id="place-search" v-model="query" type="search" placeholder="Clinic, suburb or community centre"><button class="primary-button" type="submit"><Search :size="18" /> Search</button></div></form>
    <div ref="mapElement" class="leaflet-map" role="img" aria-label="Interactive map showing searched support locations"></div>
    <p v-if="message" class="alert error" role="alert">{{ message }}</p><p v-if="routeSummary" class="alert success" role="status"><Navigation :size="18" /> {{ routeSummary }}</p>
    <ul v-if="results.length" class="place-results"><li v-for="place in results" :key="place.place_id"><span><MapPin :size="18" /> {{ place.display_name }}</span><button class="text-button" type="button" @click="routeTo(place)">Route here</button></li></ul>
  </section>
</template>
