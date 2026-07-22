<script setup>
import { ref } from 'vue'
import { CalendarDays, HeartHandshake, Menu, Phone, ShieldCheck, X } from 'lucide-vue-next'

const menuOpen = ref(false)
const activeView = ref('home')

const services = [
  { id: 'health-check', title: 'Community health check', summary: 'A friendly wellbeing check with clear next-step advice.', icon: HeartHandshake, availability: '4 appointments available' },
  { id: 'home-visit', title: 'Volunteer home visit', summary: 'Practical support and companionship in the comfort of home.', icon: ShieldCheck, availability: 'Next visit: Thursday' },
  { id: 'transport', title: 'Appointment transport', summary: 'A safe lift to a clinic, pharmacy or community centre.', icon: CalendarDays, availability: 'Bookings open this week' },
]

function showView(view) {
  activeView.value = view
  menuOpen.value = false
}
</script>

<template>
  <a class="skip-link" href="#main-content">Skip to main content</a>
  <header class="site-header">
    <button class="brand" type="button" @click="showView('home')" aria-label="SilverCare Connect home">
      <span class="brand-mark"><HeartHandshake :size="25" /></span>
      <span><strong>SilverCare</strong><small>Connect</small></span>
    </button>

    <button class="icon-button menu-button" type="button" :aria-expanded="menuOpen" aria-label="Toggle navigation" @click="menuOpen = !menuOpen">
      <X v-if="menuOpen" />
      <Menu v-else />
    </button>

    <nav :class="{ open: menuOpen }" aria-label="Primary navigation">
      <button :class="{ active: activeView === 'home' }" type="button" @click="showView('home')">Home</button>
      <button :class="{ active: activeView === 'services' }" type="button" @click="showView('services')">Services</button>
      <a class="phone-link" href="tel:1800000000"><Phone :size="18" /> 1800 000 000</a>
    </nav>
  </header>

  <main id="main-content">
    <section v-if="activeView === 'home'" class="home-view">
      <div class="welcome-band">
        <div>
          <p class="eyebrow">Community health support</p>
          <h1>Practical care, made easier.</h1>
          <p class="lead">Find trusted support, arrange a service and keep important care information in one calm place.</p>
          <button class="primary-button" type="button" @click="showView('services')">
            <CalendarDays :size="20" /> View available support
          </button>
        </div>
        <img src="/community-care.svg" alt="A support worker helping an older adult review care information">
      </div>

      <div class="content-section">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Support nearby</p>
            <h2>Services people use most</h2>
          </div>
          <button class="text-button" type="button" @click="showView('services')">View all services</button>
        </div>
        <div class="service-grid">
          <article v-for="service in services" :key="service.id" class="service-card">
            <component :is="service.icon" :size="27" aria-hidden="true" />
            <h3>{{ service.title }}</h3>
            <p>{{ service.summary }}</p>
            <span>{{ service.availability }}</span>
          </article>
        </div>
      </div>
    </section>

    <section v-else class="content-section services-view">
      <p class="eyebrow">Available support</p>
      <h1>Choose a service</h1>
      <p class="lead">Our team will confirm the details after a request is sent.</p>
      <div class="service-list">
        <article v-for="service in services" :key="service.id">
          <div class="service-icon"><component :is="service.icon" /></div>
          <div>
            <h2>{{ service.title }}</h2>
            <p>{{ service.summary }}</p>
            <strong>{{ service.availability }}</strong>
          </div>
          <button class="secondary-button" type="button">Select service</button>
        </article>
      </div>
    </section>
  </main>

  <footer>
    <strong>SilverCare Connect</strong>
    <span>Accessible community support for older adults.</span>
  </footer>
</template>
