<template>
  <div class="app-shell">
    <header class="border-bottom bg-white">
      <nav class="navbar navbar-expand-lg container py-3">
        <router-link class="navbar-brand fw-bold text-primary" to="/">NoMash Library</router-link>

        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNavigation"
          aria-controls="mainNavigation"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>

        <div id="mainNavigation" class="collapse navbar-collapse">
          <ul class="navbar-nav ms-auto align-items-lg-center gap-lg-2">
            <li class="nav-item">
              <router-link class="nav-link" to="/">Home</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/about">About</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/vue-concepts">Vue Concepts</router-link>
            </li>
            <li v-if="!isAuthenticated" class="nav-item">
              <router-link class="btn btn-outline-primary btn-sm ms-lg-2" to="/login">Login</router-link>
            </li>
            <li v-else class="nav-item">
              <button class="btn btn-outline-danger btn-sm ms-lg-2" type="button" @click="handleLogout">
                Logout
              </button>
            </li>
          </ul>
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
  background: #f6f8fb;
}

.page-wrap {
  padding: 2rem 0 3rem;
}

.router-link-active:not(.navbar-brand) {
  color: #0d6efd;
  font-weight: 700;
}
</style>
