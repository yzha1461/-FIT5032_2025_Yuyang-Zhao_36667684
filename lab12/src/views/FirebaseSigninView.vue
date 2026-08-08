<template>
  <section class="container">
    <div class="row justify-content-center">
      <div class="col-lg-7">
        <div class="card shadow-sm border-0">
          <div class="card-body p-4">
            <p class="text-uppercase text-primary fw-bold small mb-2">Firebase Authentication</p>
            <h1 class="h2 fw-bold mb-3">Firebase Sign In</h1>

            <div v-if="!isFirebaseConfigured" class="alert alert-warning">
              Firebase is not configured yet. Add your Firebase web app values to a local .env file.
            </div>

            <form novalidate @submit.prevent="signInUser">
              <div class="mb-3">
                <label for="signinEmail" class="form-label">Email address</label>
                <input
                  id="signinEmail"
                  v-model="email"
                  class="form-control"
                  autocomplete="email"
                  required
                  type="email"
                />
              </div>

              <div class="mb-3">
                <label for="signinPassword" class="form-label">Password</label>
                <input
                  id="signinPassword"
                  v-model="password"
                  class="form-control"
                  autocomplete="current-password"
                  required
                  type="password"
                />
              </div>

              <div class="mb-4">
                <label for="signinRole" class="form-label">Sign in role</label>
                <select id="signinRole" v-model="selectedRole" class="form-select">
                  <option v-for="role in roleOptions" :key="role.value" :value="role.value">
                    {{ role.label }}
                  </option>
                </select>
              </div>

              <button class="btn btn-primary w-100" :disabled="isSubmitting || !isFirebaseConfigured">
                {{ isSubmitting ? 'Signing in...' : 'Sign In' }}
              </button>
            </form>

            <div v-if="message" class="alert mt-4" :class="messageClass">
              {{ message }}
            </div>

            <div class="bg-light rounded-2 p-3 mt-4">
              <p class="mb-1"><strong>Current user:</strong> {{ currentUserEmail }}</p>
              <p class="mb-0"><strong>Current role:</strong> {{ selectedRoleLabel }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth'
import { auth, isFirebaseConfigured } from '../firebase'

const roleOptions = [
  { value: 'member', label: 'Library Member' },
  { value: 'librarian', label: 'Librarian' },
  { value: 'admin', label: 'Administrator' }
]

const email = ref('')
const password = ref('')
const selectedRole = ref(localStorage.getItem('nomashFirebaseRole') || 'member')
const currentUser = ref(null)
const message = ref('')
const messageType = ref('success')
const isSubmitting = ref(false)

let stopAuthListener = null

const currentUserEmail = computed(() => currentUser.value?.email || 'No Firebase user signed in')
const selectedRoleLabel = computed(
  () => roleOptions.find((role) => role.value === selectedRole.value)?.label || 'Library Member'
)
const messageClass = computed(() =>
  messageType.value === 'success' ? 'alert-success' : 'alert-danger'
)

onMounted(() => {
  if (!auth) {
    return
  }

  stopAuthListener = onAuthStateChanged(auth, (user) => {
    currentUser.value = user
    console.log('Current Firebase user:', user)
  })
})

onUnmounted(() => {
  if (stopAuthListener) {
    stopAuthListener()
  }
})

const signInUser = async () => {
  if (!auth) {
    messageType.value = 'error'
    message.value = 'Firebase configuration is missing.'
    return
  }

  isSubmitting.value = true
  message.value = ''

  try {
    const credential = await signInWithEmailAndPassword(auth, email.value.trim(), password.value)
    localStorage.setItem('nomashFirebaseRole', selectedRole.value)
    currentUser.value = credential.user
    messageType.value = 'success'
    message.value = `Signed in as ${selectedRoleLabel.value}. Open Console to see current user.`
    console.log('Signed in Firebase user:', credential.user)
    console.log('Signed in role:', selectedRole.value)
  } catch (error) {
    messageType.value = 'error'
    message.value = error.code || error.message
    console.error('Firebase sign in error:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>
