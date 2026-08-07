<template>
  <div class="app-shell">
    <header class="site-header">
      <nav class="site-nav container" aria-label="Primary navigation">
        <router-link class="brand" to="/">NoMash Library</router-link>
        <div class="nav-links">
          <router-link to="/">Home</router-link>
          <router-link to="/WeatherCheck">Get Weather</router-link>
          <router-link to="/CountBookAPI">Book API</router-link>
          <router-link to="/GetAllBookAPI">All Books JSON</router-link>
          <router-link to="/about">About</router-link>
          <router-link v-if="!isAuthenticated" class="nav-action" to="/login">Login</router-link>
          <button v-else class="nav-action logout-action" type="button" @click="handleLogout">
            Logout
          </button>
        </div>
      </nav>
    </header>

    <main class="page-wrap">
      <router-view></router-view>
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { isAuthenticated, logout } from './router'

const router = useRouter()

const handleLogout = () => {
  logout()
  router.push('/login')
}
</script>

<style scoped>
.app-shell {
  min-height: 100vh;
  background: #f5f7fb;
}

.page-wrap {
  padding: 2rem 0 3rem;
}

.site-header {
  border-bottom: 1px solid #dbe1ea;
  background: #ffffff;
}

.site-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  min-height: 68px;
}

.brand {
  color: #0f766e;
  font-size: 1.08rem;
  font-weight: 800;
  text-decoration: none;
  white-space: nowrap;
}

.nav-links {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 6px 14px;
}

.nav-links a,
.logout-action {
  border: 0;
  background: transparent;
  color: #536174;
  cursor: pointer;
  font: inherit;
  font-size: 0.88rem;
  padding: 6px 0;
  text-decoration: none;
}

.nav-links a:hover,
.nav-links a.router-link-active,
.logout-action:hover {
  color: #0f766e;
}

.nav-action {
  border: 1px solid #0f766e !important;
  border-radius: 5px;
  color: #0f766e !important;
  padding: 6px 10px !important;
}

.logout-action {
  border-color: #b42318 !important;
  color: #b42318 !important;
}

@media (max-width: 780px) {
  .site-nav {
    align-items: flex-start;
    flex-direction: column;
    gap: 10px;
    padding-bottom: 12px;
    padding-top: 12px;
  }

  .nav-links {
    justify-content: flex-start;
  }
}
</style>
