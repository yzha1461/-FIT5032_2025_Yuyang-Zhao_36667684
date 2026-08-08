<template>
  <div class="library-home">
    <section class="library-hero" aria-labelledby="library-title">
      <div class="container hero-grid">
        <div class="hero-copy">
          <p class="eyebrow">Digital collection</p>
          <h1 id="library-title">NoMash Library</h1>
          <p class="hero-description">
            A focused library workspace for discovering books, checking local collection data,
            and planning the next visit.
          </p>
          <div class="hero-actions">
            <a class="primary-action" href="#collection">Browse collection</a>
            <router-link class="secondary-action" to="/WeatherCheck">Check weather</router-link>
          </div>
        </div>

        <dl class="collection-summary" aria-label="Collection summary">
          <div>
            <dt>Featured authors</dt>
            <dd>{{ authors.length }}</dd>
          </div>
          <div>
            <dt>Available titles</dt>
            <dd>{{ books.length }}</dd>
          </div>
          <div>
            <dt>Collection focus</dt>
            <dd>Classics</dd>
          </div>
        </dl>
      </div>
    </section>

    <div class="container home-content">
      <section class="service-strip" aria-label="Library services">
        <article>
          <p>Local data</p>
          <strong>{{ authors.length }} authors / {{ books.length }} books</strong>
        </article>
        <article>
          <p>Weather service</p>
          <strong>City search and location lookup</strong>
        </article>
        <article>
          <p>Library access</p>
          <strong>Membership registration available</strong>
        </article>
      </section>

      <section class="workspace-section" aria-labelledby="workspace-title">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Workspace</p>
            <h2 id="workspace-title">Start where you need to</h2>
          </div>
        </div>

        <div class="tool-grid">
          <router-link class="tool-card weather-tool" to="/WeatherCheck">
            <span class="tool-label">External API</span>
            <h3>Get Weather</h3>
            <p>Search any city in Celsius or use the browser location service.</p>
            <span class="tool-link">Open weather -></span>
          </router-link>

          <router-link class="tool-card" to="/CountBookAPI">
            <span class="tool-label">Local JSON</span>
            <h3>Collection counts</h3>
            <p>View the current author and book totals in a structured API response.</p>
            <span class="tool-link">View counts -></span>
          </router-link>

          <router-link class="tool-card" to="/GetAllBookAPI">
            <span class="tool-label">Local JSON</span>
            <h3>Browse all books</h3>
            <p>Inspect every book record transformed from the authors collection.</p>
            <span class="tool-link">Open book data -></span>
          </router-link>
        </div>
      </section>

      <section id="collection" class="collection-section" aria-labelledby="collection-title">
        <div class="section-heading collection-heading">
          <div>
            <p class="eyebrow">Featured shelf</p>
            <h2 id="collection-title">From the collection</h2>
          </div>
          <router-link class="text-link" to="/GetAllBookAPI">All book data -></router-link>
        </div>

        <div class="book-grid">
          <article v-for="book in books" :key="`${book.author}-${book.title}`" class="book-card">
            <div class="book-spine" :class="book.tone"></div>
            <div>
              <p class="book-year">{{ book.year }}</p>
              <h3>{{ book.title }}</h3>
              <p class="book-author">{{ book.author }}</p>
              <p class="book-genre">{{ book.genre }}</p>
            </div>
          </article>
        </div>
      </section>

      <section id="membership" class="membership-section" aria-labelledby="membership-title">
        <div class="membership-heading">
          <p class="eyebrow">Membership</p>
          <h2 id="membership-title">Create a library account</h2>
          <p>Complete the form to record a local registration entry.</p>
        </div>

        <form class="registration-form" novalidate @submit.prevent="submitForm">
          <div class="form-grid">
            <div>
              <label for="username">Username</label>
              <input id="username" v-model.trim="formData.username" type="text" :class="{ invalid: errors.username }" @blur="validateName(true)" @input="validateName(false)">
              <small v-if="errors.username">{{ errors.username }}</small>
            </div>
            <div>
              <label for="password">Password</label>
              <input id="password" v-model="formData.password" type="password" :class="{ invalid: errors.password }" @blur="validatePassword(true)" @input="validatePassword(false)">
              <small v-if="errors.password">{{ errors.password }}</small>
            </div>
            <div>
              <label for="confirm-password">Confirm password</label>
              <input id="confirm-password" v-model="formData.confirmPassword" type="password" :class="{ invalid: errors.confirmPassword }" @blur="validateConfirmPassword(true)">
              <small v-if="errors.confirmPassword">{{ errors.confirmPassword }}</small>
            </div>
            <div>
              <label for="suburb">Suburb</label>
              <input id="suburb" type="text" :value="formData.suburb" readonly>
            </div>
            <div>
              <label for="gender">Gender</label>
              <select id="gender" v-model="formData.gender" :class="{ invalid: errors.gender }" @blur="validateGender(true)" @change="validateGender(false)">
                <option disabled value="">Please select</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
              <small v-if="errors.gender">{{ errors.gender }}</small>
            </div>
            <div class="resident-field">
              <input id="isAustralian" v-model="formData.isAustralian" type="checkbox" @change="validateResident(true)">
              <label for="isAustralian">Australian resident</label>
              <small v-if="errors.isAustralian">{{ errors.isAustralian }}</small>
            </div>
            <div class="full-width">
              <label for="reason">Reason for joining</label>
              <textarea id="reason" v-model.trim="formData.reason" :class="{ invalid: errors.reason }" rows="3" @blur="validateReason(true)" @input="validateReason(false)"></textarea>
              <small v-if="errors.reason">{{ errors.reason }}</small>
              <small v-else-if="friendMessage" class="success-note">Great to have a friend.</small>
            </div>
          </div>
          <div class="form-actions">
            <button class="submit-button" type="submit">Create account</button>
            <button class="clear-button" type="button" @click="clearForm">Clear</button>
          </div>
        </form>

        <div v-if="submittedUsers.length" class="submitted-panel" aria-live="polite">
          <strong>Registration recorded</strong>
          <span>{{ submittedUsers[submittedUsers.length - 1].username }} from {{ submittedUsers[submittedUsers.length - 1].suburb }}</span>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import authors from '../assets/json/authors.json'

const books = computed(() => authors.flatMap((author, authorIndex) => author.famousWorks.map((book, bookIndex) => ({
  ...book,
  author: author.name,
  genre: author.genre,
  tone: `tone-${(authorIndex + bookIndex) % 4}`
}))))

const emptyForm = () => ({
  username: '', password: '', confirmPassword: '', isAustralian: false,
  gender: '', reason: '', suburb: 'Clayton'
})

const emptyErrors = () => ({
  username: null, password: null, confirmPassword: null, isAustralian: null,
  gender: null, reason: null
})

const formData = ref(emptyForm())
const errors = ref(emptyErrors())
const submittedUsers = ref([])
const friendMessage = computed(() => formData.value.reason.toLowerCase().includes('friend'))

const setError = (field, message, showError) => {
  if (showError || !message) errors.value[field] = message
  return !message
}

const validateName = (blur) => setError('username', formData.value.username.length < 3 ? 'Name must be at least 3 characters' : null, blur)

const validatePassword = (blur) => {
  const password = formData.value.password
  const valid = password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password) && /[!@#$%^&*(),.?":{}|<>]/.test(password)
  validateConfirmPassword(false)
  return setError('password', valid ? null : 'Use 8+ characters with uppercase, lowercase, number, and symbol', blur)
}

const validateConfirmPassword = (blur) => setError('confirmPassword', formData.value.confirmPassword && formData.value.confirmPassword === formData.value.password ? null : 'Passwords do not match', blur)
const validateResident = (blur) => setError('isAustralian', formData.value.isAustralian ? null : 'Please confirm residency', blur)
const validateGender = (blur) => setError('gender', formData.value.gender ? null : 'Please select a gender', blur)
const validateReason = (blur) => setError('reason', formData.value.reason.length >= 10 ? null : 'Reason must be at least 10 characters', blur)

const submitForm = () => {
  const valid = [validateName(true), validatePassword(true), validateConfirmPassword(true), validateResident(true), validateGender(true), validateReason(true)].every(Boolean)
  if (!valid) return
  submittedUsers.value.push({ ...formData.value })
  clearForm()
}

const clearForm = () => {
  formData.value = emptyForm()
  errors.value = emptyErrors()
}
</script>

<style scoped>
.library-home { color: #172033; }
.library-hero { position: relative; isolation: isolate; min-height: 430px; display: flex; align-items: end; padding: 56px 0 46px; background: #153a39 url('https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1800&q=85') center / cover no-repeat; }
.library-hero::before { content: ''; position: absolute; inset: 0; z-index: -1; background: rgba(11, 37, 37, 0.76); }
.hero-grid { display: grid; grid-template-columns: minmax(0, 1.5fr) minmax(260px, 0.75fr); align-items: end; gap: 48px; }
.hero-copy { max-width: 650px; color: #ffffff; }
.eyebrow { margin: 0 0 10px; color: #a7f3d0; font-size: 0.76rem; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; }
.hero-copy h1 { margin: 0; font-size: clamp(2.55rem, 6vw, 4.8rem); font-weight: 800; line-height: 1; }
.hero-description { max-width: 560px; margin: 18px 0 0; color: #ecfdf5; font-size: 1.05rem; line-height: 1.65; }
.hero-actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 26px; }
.primary-action, .secondary-action { min-height: 42px; display: inline-flex; align-items: center; border: 1px solid transparent; border-radius: 5px; padding: 0 15px; font-weight: 750; text-decoration: none; }
.primary-action { background: #f0b55d; color: #202327; }
.secondary-action { border-color: #d1fae5; color: #ffffff; }
.collection-summary { display: grid; gap: 1px; margin: 0; border: 1px solid rgba(209, 250, 229, 0.45); background: rgba(12, 46, 44, 0.9); }
.collection-summary div { padding: 16px 18px; border-bottom: 1px solid rgba(209, 250, 229, 0.24); }
.collection-summary div:last-child { border-bottom: 0; }
.collection-summary dt { color: #bbf7d0; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; }
.collection-summary dd { margin: 4px 0 0; color: #ffffff; font-size: 1.25rem; font-weight: 800; }
.home-content { padding-top: 30px; padding-bottom: 56px; }
.service-strip { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0; border: 1px solid #dce3e7; background: #ffffff; }
.service-strip article { min-height: 94px; padding: 18px 20px; border-right: 1px solid #dce3e7; }
.service-strip article:last-child { border-right: 0; }
.service-strip p { margin: 0 0 7px; color: #5e6b73; font-size: 0.78rem; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; }
.service-strip strong { font-size: 0.96rem; }
.workspace-section, .collection-section, .membership-section { margin-top: 54px; }
.section-heading { display: flex; align-items: end; justify-content: space-between; gap: 20px; margin-bottom: 20px; }
.section-heading .eyebrow, .membership-heading .eyebrow { color: #0f766e; }
.section-heading h2, .membership-heading h2 { margin: 0; font-size: clamp(1.65rem, 3vw, 2.35rem); line-height: 1.15; }
.tool-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.tool-card { min-height: 245px; display: flex; flex-direction: column; align-items: flex-start; border: 1px solid #dce3e7; border-radius: 7px; background: #ffffff; color: #172033; padding: 24px; text-decoration: none; transition: border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease; }
.tool-card:hover { border-color: #0f766e; box-shadow: 0 10px 22px rgba(23, 32, 51, 0.1); color: #172033; transform: translateY(-2px); }
.weather-tool { border-top: 4px solid #ef7d4d; }
.tool-label { color: #0f766e; font-size: 0.74rem; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase; }
.tool-card h3 { margin: 20px 0 10px; font-size: 1.3rem; }
.tool-card p { margin: 0; color: #56636f; line-height: 1.55; }
.tool-link { margin-top: auto; padding-top: 24px; color: #0f766e; font-weight: 800; }
.collection-section { border-top: 1px solid #dce3e7; padding-top: 48px; }
.text-link { color: #0f766e; font-weight: 800; text-decoration: none; }
.book-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
.book-card { display: grid; grid-template-columns: 12px 1fr; gap: 15px; min-height: 150px; border: 1px solid #dce3e7; background: #ffffff; padding: 17px; }
.book-spine { border-radius: 2px; background: #164e63; }
.tone-1 { background: #b45309; }.tone-2 { background: #9f1239; }.tone-3 { background: #4d7c0f; }
.book-year { margin: 0; color: #66737d; font-size: 0.8rem; font-weight: 750; }
.book-card h3 { margin: 6px 0 4px; font-size: 1.08rem; line-height: 1.25; }
.book-author, .book-genre { margin: 0; color: #52606b; font-size: 0.88rem; }.book-genre { margin-top: 8px; color: #0f766e; }
.membership-section { display: grid; grid-template-columns: minmax(220px, 0.65fr) minmax(0, 1.35fr); gap: 34px; border-top: 1px solid #dce3e7; padding-top: 48px; }
.membership-heading > p:last-child { color: #56636f; line-height: 1.6; }
.registration-form { border: 1px solid #dce3e7; border-radius: 7px; background: #ffffff; padding: 24px; }
.form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 18px; }.full-width { grid-column: 1 / -1; }
.form-grid label { display: block; margin-bottom: 7px; color: #334155; font-size: 0.86rem; font-weight: 750; }
.form-grid input:not([type='checkbox']), .form-grid select, .form-grid textarea { width: 100%; border: 1px solid #b9c4cc; border-radius: 5px; background: #ffffff; padding: 10px 11px; color: #172033; }
.form-grid textarea { resize: vertical; }.form-grid .invalid { border-color: #b42318; }
.form-grid small { display: block; margin-top: 6px; color: #b42318; font-size: 0.77rem; }.form-grid .success-note { color: #0f766e; }
.resident-field { display: flex; flex-wrap: wrap; align-content: start; gap: 8px; padding-top: 32px; }.resident-field label { margin: 0; }.resident-field small { flex-basis: 100%; }
.form-actions { display: flex; gap: 10px; margin-top: 22px; }.submit-button, .clear-button { min-height: 40px; border-radius: 5px; padding: 0 14px; font-weight: 750; }.submit-button { border: 1px solid #0f766e; background: #0f766e; color: #ffffff; }.clear-button { border: 1px solid #64748b; background: #ffffff; color: #334155; }
.submitted-panel { grid-column: 2; display: grid; gap: 3px; border-left: 4px solid #0f766e; background: #ecfdf5; padding: 13px 16px; color: #134e4a; }
@media (max-width: 900px) { .hero-grid, .membership-section { grid-template-columns: 1fr; }.collection-summary { max-width: 360px; }.book-grid { grid-template-columns: repeat(2, 1fr); }.submitted-panel { grid-column: auto; } }
@media (max-width: 700px) { .library-hero { min-height: 520px; padding: 44px 0 34px; }.service-strip, .tool-grid, .book-grid, .form-grid { grid-template-columns: 1fr; }.service-strip article { border-right: 0; border-bottom: 1px solid #dce3e7; }.service-strip article:last-child { border-bottom: 0; }.section-heading { align-items: start; flex-direction: column; }.tool-card { min-height: 200px; }.resident-field { padding-top: 0; } }
</style>
