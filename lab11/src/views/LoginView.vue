<template>
  <section class="container">
    <div class="mx-auto content-panel">
      <span class="badge text-bg-primary mb-3">Secure Routing</span>
      <h1 class="h2 fw-bold mb-3">Member Login</h1>

      <form novalidate @submit.prevent="submitLogin">
        <div class="mb-3">
          <label for="login-username" class="form-label">Username</label>
          <input
            id="login-username"
            v-model.trim="credentials.username"
            class="form-control"
            type="text"
            placeholder="student"
          >
        </div>

        <div class="mb-3">
          <label for="login-password" class="form-label">Password</label>
          <input
            id="login-password"
            v-model.trim="credentials.password"
            class="form-control"
            type="password"
            placeholder="library123"
          >
        </div>

        <p v-if="errorMessage" class="text-danger small">{{ errorMessage }}</p>

        <button class="btn btn-primary" type="submit">Login</button>
      </form>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { login } from '../router'

const route = useRoute()
const router = useRouter()

const credentials = ref({
  username: '',
  password: ''
})
const errorMessage = ref('')

const submitLogin = () => {
  const success = login(credentials.value.username, credentials.value.password)

  if (!success) {
    errorMessage.value = 'Invalid username or password'
    return
  }

  router.push(route.query.redirect || '/about')
}
</script>

<style scoped>
.content-panel {
  max-width: 520px;
  background: #fff;
  border: 1px solid #dfe7f3;
  border-radius: 8px;
  padding: 2rem;
}
</style>
