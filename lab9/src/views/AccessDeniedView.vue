<template>
  <section class="container">
    <div class="mx-auto content-panel text-center">
      <span class="badge text-bg-danger mb-3">Access Denied</span>
      <h1 class="h2 fw-bold mb-3">Login Required</h1>
      <p class="mb-4">
        The About page is restricted to authenticated library members. Please log
        in before opening this route.
      </p>
      <router-link class="btn btn-primary" :to="{ name: 'login', query: { redirect } }">
        Go to Login
      </router-link>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const redirect = computed(() => route.query.redirect || '/about')
</script>

<style scoped>
.content-panel {
  max-width: 620px;
  background: #fff;
  border: 1px solid #dfe7f3;
  border-radius: 8px;
  padding: 2rem;
}
</style>
