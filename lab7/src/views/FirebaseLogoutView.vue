<template>
  <section class="container">
    <div class="row justify-content-center">
      <div class="col-lg-7">
        <div class="card shadow-sm border-0">
          <div class="card-body p-4">
            <p class="text-uppercase text-primary fw-bold small mb-2">Firebase Authentication</p>
            <h1 class="h2 fw-bold mb-3">Firebase Logout</h1>

            <div v-if="!isFirebaseConfigured" class="alert alert-warning">
              Firebase is not configured yet. Add your Firebase web app values to a local .env file.
            </div>

            <div class="bg-light rounded-2 p-3 mb-4">
              <p class="mb-1"><strong>Current user:</strong> {{ currentUserEmail }}</p>
              <p class="mb-0"><strong>Stored role:</strong> {{ currentRoleLabel }}</p>
            </div>

            <button class="btn btn-danger w-100" :disabled="isSubmitting || !isFirebaseConfigured" @click="logoutUser">
              {{ isSubmitting ? 'Signing out...' : 'Log Out' }}
            </button>

            <div v-if="message" class="alert mt-4" :class="messageClass">
              {{ message }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth, isFirebaseConfigured } from '../firebase'

const roleLabels = {
  member: 'Library Member',
  librarian: 'Librarian',
  admin: 'Administrator'
}

const currentUser = ref(null)
const currentRole = ref(localStorage.getItem('nomashFirebaseRole') || 'member')
const message = ref('')
const messageType = ref('success')
const isSubmitting = ref(false)

let stopAuthListener = null

const currentUserEmail = computed(() => currentUser.value?.email || 'No Firebase user signed in')
const currentRoleLabel = computed(() => roleLabels[currentRole.value] || 'Library Member')
const messageClass = computed(() =>
  messageType.value === 'success' ? 'alert-success' : 'alert-danger'
)

onMounted(() => {
  if (!auth) {
    return
  }

  stopAuthListener = onAuthStateChanged(auth, (user) => {
    currentUser.value = user
    console.log('Logout page current user:', user)
  })
})

onUnmounted(() => {
  if (stopAuthListener) {
    stopAuthListener()
  }
})

const logoutUser = async () => {
  if (!auth) {
    messageType.value = 'error'
    message.value = 'Firebase configuration is missing.'
    return
  }

  isSubmitting.value = true
  message.value = ''

  try {
    console.log('Before Firebase logout current user:', auth.currentUser)
    await signOut(auth)
    localStorage.removeItem('nomashFirebaseRole')
    currentRole.value = 'member'
    messageType.value = 'success'
    message.value = 'Logged out. Open Console to confirm current user is null.'
    console.log('After Firebase logout current user:', auth.currentUser)
  } catch (error) {
    messageType.value = 'error'
    message.value = error.code || error.message
    console.error('Firebase logout error:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>
