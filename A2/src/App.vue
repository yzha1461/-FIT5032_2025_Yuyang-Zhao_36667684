<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import {
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  HeartHandshake,
  LogOut,
  Menu,
  Phone,
  ShieldCheck,
  UserRound,
  UsersRound,
  X,
} from 'lucide-vue-next'

const STORAGE = {
  users: 'silvercare_users_v2',
  bookings: 'silvercare_bookings_v2',
  session: 'silvercare_session_v2',
}

const services = [
  { id: 'health-check', title: 'Community health check', summary: 'A friendly wellbeing check with clear next-step advice.', icon: HeartHandshake },
  { id: 'home-visit', title: 'Volunteer home visit', summary: 'Practical support and companionship in the comfort of home.', icon: ShieldCheck },
  { id: 'transport', title: 'Appointment transport', summary: 'A safe lift to a clinic, pharmacy or community centre.', icon: CalendarDays },
  { id: 'social', title: 'Social connection visit', summary: 'Conversation and a shared activity with a trained volunteer.', icon: UsersRound },
]

const menuOpen = ref(false)
const ready = ref(false)
const view = ref('login')
const session = ref(null)
const users = ref([])
const bookings = ref([])
const authError = ref('')
const authMessage = ref('')
const bookingErrors = ref({})
const bookingMessage = ref('')

const loginForm = reactive({ email: '', password: '' })
const registerForm = reactive({ name: '', email: '', password: '', confirmPassword: '' })
const bookingForm = reactive({ serviceId: 'health-check', date: '', phone: '', notes: '' })

const memberBookings = computed(() => bookings.value.filter((booking) => booking.userId === session.value?.id))

function readStorage(key, fallback) {
  try {
    const stored = JSON.parse(localStorage.getItem(key))
    return stored ?? fallback
  } catch {
    return fallback
  }
}

function persist() {
  localStorage.setItem(STORAGE.users, JSON.stringify(users.value))
  localStorage.setItem(STORAGE.bookings, JSON.stringify(bookings.value))
}

async function hashPassword(password, salt) {
  const bytes = new TextEncoder().encode(`${salt}:${password}`)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

async function makeUser(profile, password) {
  const salt = crypto.randomUUID()
  return { ...profile, salt, passwordHash: await hashPassword(password, salt) }
}

async function initialiseData() {
  users.value = readStorage(STORAGE.users, [])
  bookings.value = readStorage(STORAGE.bookings, [])

  if (!users.value.length) {
    users.value = [
      await makeUser({ id: 'member-demo', name: 'Margaret Wilson', email: 'member@silvercare.test', role: 'member' }, 'Care123!Secure'),
      await makeUser({ id: 'staff-demo', name: 'Sofia Patel', email: 'staff@silvercare.test', role: 'staff' }, 'Staff123!Secure'),
    ]
    persist()
  }

  try {
    session.value = JSON.parse(sessionStorage.getItem(STORAGE.session))
  } catch {
    session.value = null
  }
  view.value = session.value ? 'dashboard' : 'login'
  ready.value = true
}

function navigate(nextView) {
  view.value = nextView
  menuOpen.value = false
  bookingMessage.value = ''
}

function validEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email)
}

function validPassword(password) {
  return password.length >= 10 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password) && /[^A-Za-z0-9]/.test(password)
}

async function login() {
  authError.value = ''
  authMessage.value = ''
  const email = loginForm.email.trim().toLowerCase()
  if (!validEmail(email) || !loginForm.password) {
    authError.value = 'Enter a valid email address and password.'
    return
  }

  const user = users.value.find((candidate) => candidate.email === email)
  if (!user || user.passwordHash !== await hashPassword(loginForm.password, user.salt)) {
    authError.value = 'The email address or password is incorrect.'
    return
  }

  session.value = { id: user.id, name: user.name, email: user.email, role: user.role }
  sessionStorage.setItem(STORAGE.session, JSON.stringify(session.value))
  loginForm.password = ''
  navigate('dashboard')
}

async function register() {
  authError.value = ''
  authMessage.value = ''
  const name = registerForm.name.trim()
  const email = registerForm.email.trim().toLowerCase()

  if (name.length < 2 || name.length > 60) {
    authError.value = 'Name must contain between 2 and 60 characters.'
    return
  }
  if (!validEmail(email)) {
    authError.value = 'Enter a valid email address.'
    return
  }
  if (users.value.some((user) => user.email === email)) {
    authError.value = 'An account already exists for this email address.'
    return
  }
  if (!validPassword(registerForm.password)) {
    authError.value = 'Password must be at least 10 characters and include upper-case, lower-case, number and symbol characters.'
    return
  }
  if (registerForm.password !== registerForm.confirmPassword) {
    authError.value = 'The passwords do not match.'
    return
  }

  const newUser = await makeUser({ id: crypto.randomUUID(), name, email, role: 'member' }, registerForm.password)
  users.value.push(newUser)
  persist()
  Object.assign(registerForm, { name: '', email: '', password: '', confirmPassword: '' })
  authMessage.value = 'Account created. You can now sign in.'
  view.value = 'login'
}

async function useDemo(role) {
  loginForm.email = role === 'staff' ? 'staff@silvercare.test' : 'member@silvercare.test'
  loginForm.password = role === 'staff' ? 'Staff123!Secure' : 'Care123!Secure'
  await login()
}

function logout() {
  sessionStorage.removeItem(STORAGE.session)
  session.value = null
  view.value = 'login'
  menuOpen.value = false
}

function validateBooking() {
  const errors = {}
  const selectedDate = new Date(`${bookingForm.date}T12:00:00`)
  const tomorrow = new Date()
  tomorrow.setHours(0, 0, 0, 0)
  tomorrow.setDate(tomorrow.getDate() + 1)

  if (!services.some((service) => service.id === bookingForm.serviceId)) errors.serviceId = 'Choose a valid service.'
  if (!bookingForm.date) errors.date = 'Choose a preferred date.'
  else if (Number.isNaN(selectedDate.getTime()) || selectedDate < tomorrow) errors.date = 'Choose a date from tomorrow onwards.'
  if (!/^(?:\+?61|0)[2-478](?:[ -]?\d){8}$/.test(bookingForm.phone.trim())) errors.phone = 'Enter a valid Australian phone number.'
  if (bookingForm.notes.length > 300) errors.notes = 'Notes must be 300 characters or fewer.'

  bookingErrors.value = errors
  return Object.keys(errors).length === 0
}

function submitBooking() {
  bookingMessage.value = ''
  if (!validateBooking()) return

  const service = services.find((item) => item.id === bookingForm.serviceId)
  bookings.value.unshift({
    id: crypto.randomUUID(),
    userId: session.value.id,
    memberName: session.value.name,
    serviceId: service.id,
    serviceTitle: service.title,
    date: bookingForm.date,
    phone: bookingForm.phone.trim(),
    notes: bookingForm.notes.trim(),
    status: 'Pending',
    createdAt: new Date().toISOString(),
  })
  persist()
  Object.assign(bookingForm, { serviceId: 'health-check', date: '', phone: '', notes: '' })
  bookingErrors.value = {}
  bookingMessage.value = 'Your support request has been sent to the SilverCare team.'
}

function updateStatus(booking, status) {
  if (session.value?.role !== 'staff') return
  booking.status = status
  persist()
}

onMounted(initialiseData)
</script>

<template>
  <a class="skip-link" href="#main-content">Skip to main content</a>

  <div v-if="!ready" class="loading" role="status">Preparing SilverCare Connect...</div>

  <template v-else-if="!session">
    <header class="simple-header">
      <button class="brand" type="button" @click="view = 'login'" aria-label="SilverCare Connect sign in">
        <span class="brand-mark"><HeartHandshake :size="25" /></span>
        <span><strong>SilverCare</strong><small>Connect</small></span>
      </button>
      <a class="phone-link" href="tel:1800000000"><Phone :size="18" /> 1800 000 000</a>
    </header>

    <main id="main-content" class="auth-layout">
      <section class="auth-intro">
        <p class="eyebrow">Community health support</p>
        <h1>Your care plans, requests and reminders in one place.</h1>
        <img src="/community-care.svg" alt="A support worker helping an older adult review care information">
      </section>

      <section class="auth-panel" :aria-labelledby="view === 'register' ? 'register-title' : 'login-title'">
        <form v-if="view === 'login'" @submit.prevent="login" novalidate>
          <p class="eyebrow">Welcome back</p>
          <h2 id="login-title">Sign in</h2>
          <p class="form-intro">Access your support hub or staff workspace.</p>
          <div v-if="authError" class="alert error" role="alert">{{ authError }}</div>
          <div v-if="authMessage" class="alert success" role="status">{{ authMessage }}</div>
          <label>Email address
            <input v-model="loginForm.email" type="email" autocomplete="email" required>
          </label>
          <label>Password
            <input v-model="loginForm.password" type="password" autocomplete="current-password" required>
          </label>
          <button class="primary-button full-button" type="submit">Sign in</button>
          <button class="text-button full-button" type="button" @click="view = 'register'; authError = ''">Create a member account</button>
          <div class="demo-access">
            <span>Demonstration access</span>
            <button type="button" @click="useDemo('member')"><UserRound :size="17" /> Member</button>
            <button type="button" @click="useDemo('staff')"><ShieldCheck :size="17" /> Staff</button>
          </div>
        </form>

        <form v-else @submit.prevent="register" novalidate>
          <p class="eyebrow">New member</p>
          <h2 id="register-title">Create an account</h2>
          <p class="form-intro">Staff accounts are managed by the charity.</p>
          <div v-if="authError" class="alert error" role="alert">{{ authError }}</div>
          <label>Full name
            <input v-model="registerForm.name" type="text" autocomplete="name" maxlength="60" required>
          </label>
          <label>Email address
            <input v-model="registerForm.email" type="email" autocomplete="email" required>
          </label>
          <label>Password
            <input v-model="registerForm.password" type="password" autocomplete="new-password" required aria-describedby="password-hint">
          </label>
          <p id="password-hint" class="field-hint">10+ characters with upper-case, lower-case, number and symbol.</p>
          <label>Confirm password
            <input v-model="registerForm.confirmPassword" type="password" autocomplete="new-password" required>
          </label>
          <button class="primary-button full-button" type="submit">Create account</button>
          <button class="text-button full-button" type="button" @click="view = 'login'; authError = ''">Back to sign in</button>
        </form>
      </section>
    </main>
  </template>

  <template v-else>
    <header class="site-header">
      <button class="brand" type="button" @click="navigate('dashboard')" aria-label="SilverCare Connect dashboard">
        <span class="brand-mark"><HeartHandshake :size="25" /></span>
        <span><strong>SilverCare</strong><small>Connect</small></span>
      </button>
      <button class="icon-button menu-button" type="button" :aria-expanded="menuOpen" aria-label="Toggle navigation" @click="menuOpen = !menuOpen">
        <X v-if="menuOpen" /><Menu v-else />
      </button>
      <nav :class="{ open: menuOpen }" aria-label="Primary navigation">
        <button :class="{ active: view === 'dashboard' }" type="button" @click="navigate('dashboard')">{{ session.role === 'staff' ? 'Operations' : 'My support' }}</button>
        <button v-if="session.role === 'member'" :class="{ active: view === 'book' }" type="button" @click="navigate('book')">Book support</button>
        <button class="logout-button" type="button" @click="logout"><LogOut :size="18" /> Sign out</button>
      </nav>
    </header>

    <main id="main-content">
      <section v-if="view === 'dashboard' && session.role === 'member'" class="content-section">
        <div class="page-heading">
          <div><p class="eyebrow">Member support hub</p><h1>Good morning, {{ session.name.split(' ')[0] }}.</h1></div>
          <button class="primary-button" type="button" @click="navigate('book')"><CalendarDays :size="20" /> Book support</button>
        </div>
        <div class="summary-grid">
          <article><span>Open requests</span><strong>{{ memberBookings.filter((item) => item.status !== 'Completed').length }}</strong><p>Requests being coordinated by our team.</p></article>
          <article><span>Support line</span><strong>1800 000 000</strong><p>Monday to Friday, 8:30 am to 5:00 pm.</p></article>
        </div>
        <section class="data-section">
          <div class="section-heading"><div><p class="eyebrow">Your activity</p><h2>Support requests</h2></div></div>
          <div v-if="memberBookings.length" class="booking-list">
            <article v-for="booking in memberBookings" :key="booking.id">
              <div><strong>{{ booking.serviceTitle }}</strong><span>{{ booking.date }}</span></div>
              <span class="status" :class="booking.status.toLowerCase()">{{ booking.status }}</span>
            </article>
          </div>
          <div v-else class="empty-state"><ClipboardList /><h3>No requests yet</h3><p>Book a service when you need practical support.</p></div>
        </section>
      </section>

      <section v-else-if="view === 'book' && session.role === 'member'" class="content-section narrow-section">
        <p class="eyebrow">Member service request</p>
        <h1>Book community support</h1>
        <p class="lead">Choose what you need and a preferred date. The team will confirm your request.</p>
        <form class="booking-form" @submit.prevent="submitBooking" novalidate>
          <div v-if="bookingMessage" class="alert success" role="status"><CheckCircle2 :size="20" /> {{ bookingMessage }}</div>
          <fieldset>
            <legend>Choose one service</legend>
            <div class="choice-grid">
              <label v-for="service in services" :key="service.id" :class="{ selected: bookingForm.serviceId === service.id }">
                <input v-model="bookingForm.serviceId" type="radio" name="service" :value="service.id">
                <component :is="service.icon" :size="23" />
                <strong>{{ service.title }}</strong>
                <span>{{ service.summary }}</span>
              </label>
            </div>
            <p v-if="bookingErrors.serviceId" class="field-error" role="alert">{{ bookingErrors.serviceId }}</p>
          </fieldset>
          <div class="form-grid">
            <label>Preferred date
              <input v-model="bookingForm.date" type="date" :aria-invalid="Boolean(bookingErrors.date)" required>
              <span v-if="bookingErrors.date" class="field-error">{{ bookingErrors.date }}</span>
            </label>
            <label>Contact phone
              <input v-model="bookingForm.phone" type="tel" inputmode="tel" placeholder="0400 000 000" :aria-invalid="Boolean(bookingErrors.phone)" required>
              <span v-if="bookingErrors.phone" class="field-error">{{ bookingErrors.phone }}</span>
            </label>
          </div>
          <label>Notes for the support team <span class="optional">Optional</span>
            <textarea v-model="bookingForm.notes" rows="4" maxlength="300" :aria-invalid="Boolean(bookingErrors.notes)"></textarea>
            <span class="field-hint">{{ bookingForm.notes.length }}/300 characters</span>
            <span v-if="bookingErrors.notes" class="field-error">{{ bookingErrors.notes }}</span>
          </label>
          <button class="primary-button" type="submit">Send support request</button>
        </form>
      </section>

      <section v-else-if="session.role === 'staff'" class="content-section">
        <div class="page-heading">
          <div><p class="eyebrow">Staff workspace</p><h1>Service operations</h1><p class="lead">Review and update community support requests.</p></div>
          <span class="role-badge"><ShieldCheck :size="17" /> Staff only</span>
        </div>
        <div class="summary-grid three">
          <article><span>Registered members</span><strong>{{ users.filter((user) => user.role === 'member').length }}</strong></article>
          <article><span>Total requests</span><strong>{{ bookings.length }}</strong></article>
          <article><span>Pending</span><strong>{{ bookings.filter((item) => item.status === 'Pending').length }}</strong></article>
        </div>
        <section class="data-section">
          <h2>Request queue</h2>
          <div v-if="bookings.length" class="table-wrap">
            <table>
              <thead><tr><th>Member</th><th>Service</th><th>Date</th><th>Contact</th><th>Status</th></tr></thead>
              <tbody>
                <tr v-for="booking in bookings" :key="booking.id">
                  <td>{{ booking.memberName }}</td><td>{{ booking.serviceTitle }}</td><td>{{ booking.date }}</td><td>{{ booking.phone }}</td>
                  <td><select :value="booking.status" :aria-label="`Status for ${booking.memberName}`" @change="updateStatus(booking, $event.target.value)"><option>Pending</option><option>Confirmed</option><option>Completed</option></select></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="empty-state"><ClipboardList /><h3>No requests in the queue</h3></div>
        </section>
      </section>
    </main>

    <footer><strong>SilverCare Connect</strong><span>Signed in as {{ session.name }} - {{ session.role }}</span></footer>
  </template>
</template>
