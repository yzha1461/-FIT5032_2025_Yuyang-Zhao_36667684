<script setup>
import { onMounted, ref } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import { CalendarDays } from 'lucide-vue-next'
import { apiGet, apiPost } from '../services/api'

const events = ref([])
const message = ref('')
const form = ref({ title: 'Volunteer home visit', start: '' })
const calendarOptions = ref({ plugins: [dayGridPlugin, interactionPlugin], initialView: 'dayGridMonth', height: 500, selectable: true, events: events.value, eventColor: '#176b55', dateClick: (info) => { form.value.start = info.dateStr; message.value = `Date selected: ${info.dateStr}` } })

async function load() { const response = await apiGet('/calendar'); events.value = response.events; calendarOptions.value = { ...calendarOptions.value, events: events.value } }
async function addEvent() {
  try { await apiPost('/calendar', form.value); message.value = 'Calendar event added.'; await load() } catch (error) { message.value = error.message }
}
onMounted(load)
</script>

<template>
  <section class="calendar-card" aria-labelledby="calendar-title">
    <div class="section-heading"><div><p class="eyebrow">F.1 innovation</p><h2 id="calendar-title">Conflict-aware appointment calendar</h2></div><CalendarDays :size="28" aria-hidden="true" /></div>
    <p class="muted-copy">Select a date in the calendar. The server rejects a second event on an occupied date.</p>
    <FullCalendar :options="calendarOptions" />
    <form class="calendar-form" @submit.prevent="addEvent"><label>Event title<input v-model="form.title" type="text" maxlength="100" required></label><label>Selected date<input v-model="form.start" type="date" required></label><button class="primary-button" type="submit">Add constrained event</button></form>
    <p v-if="message" class="alert" :class="message.startsWith('Calendar') || message.startsWith('Date') ? 'success' : 'error'" role="status">{{ message }}</p>
  </section>
</template>
