<script setup>
import { computed, onMounted, ref } from 'vue'
import { Download, ExternalLink, HeartHandshake, LogOut, Menu, ShieldCheck, X } from 'lucide-vue-next'
import LoginView from './views/LoginView.vue'
import DataTable from './components/DataTable.vue'
import MapPanel from './components/MapPanel.vue'
import CalendarPanel from './components/CalendarPanel.vue'
import EmailComposer from './components/EmailComposer.vue'
import StatChart from './components/StatChart.vue'
import { apiGet, apiPatch, setToken } from './services/api'
import { firebaseLogout } from './services/firebase'
import { downloadCsv, downloadPdf } from './services/export'

const user = ref(null)
const loading = ref(true)
const activeView = ref('dashboard')
const menuOpen = ref(false)
const requests = ref([])
const users = ref([])
const ratings = ref([])
const stats = ref({ members: 0, requests: 0, pending: 0, byService: [] })
const error = ref('')
const highContrast = ref(false)

const requestColumns = [
  { key: 'memberName', label: 'Member' }, { key: 'serviceTitle', label: 'Service' }, { key: 'date', label: 'Date' }, { key: 'phone', label: 'Phone' }, { key: 'status', label: 'Status' },
]
const userColumns = [{ key: 'name', label: 'Name' }, { key: 'email', label: 'Email' }, { key: 'role', label: 'Role' }, { key: 'createdAt', label: 'Joined' }]
const selectedRecipients = computed(() => users.value.filter((candidate) => candidate.role === 'member').map((candidate) => candidate.email))
const serviceLabels = [{ id: 'health-check', label: 'Community health check' }, { id: 'home-visit', label: 'Volunteer home visit' }, { id: 'transport', label: 'Appointment transport' }, { id: 'social', label: 'Social connection visit' }]
const memberAverages = computed(() => serviceLabels.map((service) => ({ ...service, average: Number(ratingFor(service.id)) || 0 })))

async function loadData() {
  loading.value = true; error.value = ''
  try {
    const me = await apiGet('/auth/me'); user.value = me.user
    requests.value = (await apiGet('/requests')).requests
    ratings.value = (await apiGet('/ratings')).ratings
    if (user.value.role === 'staff') { users.value = (await apiGet('/users')).users; stats.value = await apiGet('/stats') }
  } catch (cause) { user.value = null; setToken(''); if (cause.message !== 'Authentication required.') error.value = cause.message } finally { loading.value = false }
}

async function authenticated(profile) { user.value = profile; activeView.value = profile.role === 'staff' ? 'admin' : 'dashboard'; await loadData() }
async function logout() { await firebaseLogout(); setToken(''); user.value = null; activeView.value = 'dashboard' }
function navigate(view) { activeView.value = view; menuOpen.value = false }
function ratingFor(serviceId) { const values = ratings.value.filter((rating) => rating.serviceId === serviceId); return values.length ? (values.reduce((sum, item) => sum + item.score, 0) / values.length).toFixed(1) : 'No ratings' }

async function updateStatus(row, event) { try { await apiPatch(`/requests/${row.id}`, { status: event.target.value }); row.status = event.target.value; stats.value.pending = requests.value.filter((item) => item.status === 'Pending').length } catch (cause) { error.value = cause.message } }
function exportRequests(format) { format === 'csv' ? downloadCsv(requests.value, requestColumns, 'silvercare-requests.csv') : downloadPdf(requests.value, requestColumns, 'SilverCare requests', 'silvercare-requests.pdf') }
function exportUsers(format) { format === 'csv' ? downloadCsv(users.value, userColumns, 'silvercare-members.csv') : downloadPdf(users.value, userColumns, 'SilverCare members', 'silvercare-members.pdf') }

onMounted(async () => { highContrast.value = localStorage.getItem('silvercare_high_contrast') === 'true'; await loadData() })
</script>

<template>
  <div v-if="loading" class="loading" role="status">Preparing SilverCare Connect...</div>
  <LoginView v-else-if="!user" @authenticated="authenticated" />
  <div v-else :class="['app-shell', { 'high-contrast': highContrast }]">
    <header class="site-header"><button class="brand" type="button" @click="navigate('dashboard')" aria-label="SilverCare Connect dashboard"><span class="brand-mark"><HeartHandshake :size="25" /></span><span><strong>SilverCare</strong><small>Connect</small></span></button><button class="icon-button menu-button" type="button" :aria-expanded="menuOpen" aria-label="Toggle navigation" @click="menuOpen = !menuOpen"><X v-if="menuOpen" /><Menu v-else /></button><nav :class="{ open: menuOpen }" aria-label="Primary navigation"><button :class="{ active: activeView === 'dashboard' }" type="button" @click="navigate('dashboard')">{{ user.role === 'staff' ? 'Operations' : 'My support' }}</button><button v-if="user.role === 'member'" :class="{ active: activeView === 'map' }" type="button" @click="navigate('map')">Find support</button><button v-if="user.role === 'staff'" :class="{ active: activeView === 'admin' }" type="button" @click="navigate('admin')">Admin dashboard</button><button v-if="user.role === 'staff'" :class="{ active: activeView === 'calendar' }" type="button" @click="navigate('calendar')">Calendar</button><button class="accessibility-button" type="button" @click="highContrast = !highContrast; localStorage.setItem('silvercare_high_contrast', String(highContrast))">{{ highContrast ? 'Standard contrast' : 'High contrast' }}</button><button class="logout-button" type="button" @click="logout"><LogOut :size="18" /> Sign out</button></nav></header>

    <main id="main-content" class="app-main">
      <div v-if="error" class="alert error page-alert" role="alert">{{ error }}</div>
      <section v-if="activeView === 'dashboard' && user.role === 'member'" class="content-section"><div class="page-heading"><div><p class="eyebrow">Member support hub</p><h1>Good morning, {{ user.name.split(' ')[0] }}.</h1><p class="lead">Your support requests, service feedback and nearby care options.</p></div><span class="role-badge"><ShieldCheck :size="17" /> Server-verified member</span></div><div class="summary-grid"><article><span>Open requests</span><strong>{{ requests.filter((item) => item.status !== 'Completed').length }}</strong><p>Requests coordinated by the SilverCare team.</p></article><article><span>Service ratings</span><strong>{{ ratings.length }}</strong><p>Your feedback helps improve local support.</p></article></div><DataTable title="My support requests" :rows="requests" :columns="requestColumns" /><section class="feedback-strip"><h2>Community averages</h2><div><span v-for="service in memberAverages" :key="service.id">{{ service.label }}: <strong>{{ service.average ? service.average.toFixed(1) : 'No ratings' }}</strong></span></div></section></section>
      <section v-else-if="activeView === 'map' && user.role === 'member'" class="content-section"><MapPanel /></section>

      <section v-else-if="activeView === 'admin' && user.role === 'staff'" class="content-section"><div class="page-heading"><div><p class="eyebrow">E.1 / F.1 innovation</p><h1>Admin dashboard</h1><p class="lead">Server-verified operational insight for the charity team.</p></div><span class="role-badge"><ShieldCheck :size="17" /> Staff-only route</span></div><div class="summary-grid three"><article><span>Registered members</span><strong>{{ stats.members }}</strong></article><article><span>Total requests</span><strong>{{ stats.requests }}</strong></article><article><span>Pending requests</span><strong>{{ stats.pending }}</strong></article></div><section class="chart-card"><div class="section-heading"><div><p class="eyebrow">Interactive chart</p><h2>Average service ratings</h2></div></div><StatChart :values="stats.byService" /></section><div class="export-actions"><button class="secondary-button" type="button" @click="exportRequests('csv')"><Download :size="18" /> Requests CSV</button><button class="secondary-button" type="button" @click="exportRequests('pdf')"><Download :size="18" /> Requests PDF</button><button class="secondary-button" type="button" @click="exportUsers('csv')"><Download :size="18" /> Members CSV</button><button class="secondary-button" type="button" @click="exportUsers('pdf')"><Download :size="18" /> Members PDF</button></div><DataTable title="All support requests" :rows="requests" :columns="requestColumns" /><DataTable title="Registered users" :rows="users" :columns="userColumns" /></section>

      <section v-else-if="activeView === 'calendar' && user.role === 'staff'" class="content-section"><CalendarPanel /><EmailComposer :recipients="selectedRecipients" /></section>
      <section v-else-if="user.role === 'staff'" class="content-section"><div class="page-heading"><div><p class="eyebrow">Operations</p><h1>Request queue</h1><p class="lead">Change a request status after the team confirms the next step.</p></div></div><DataTable title="Request queue" :rows="requests" :columns="requestColumns" /><div class="quick-status"><label>Update selected request status<select v-if="requests.length" :value="requests[0].status" @change="updateStatus(requests[0], $event)"><option>Pending</option><option>Confirmed</option><option>Completed</option></select></label></div></section>
    </main>
    <footer><strong>SilverCare Connect</strong><span>Signed in as {{ user.name }} - {{ user.role }} - <a href="/api/health" target="_blank" rel="noreferrer"><ExternalLink :size="14" /> API health</a></span></footer>
  </div>
</template>
