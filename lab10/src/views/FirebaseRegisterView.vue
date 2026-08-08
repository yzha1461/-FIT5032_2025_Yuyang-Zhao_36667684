<template>
  <section class="container">
    <div class="row justify-content-center">
      <div class="col-lg-7">
        <div class="card shadow-sm border-0">
          <div class="card-body p-4">
            <p class="text-uppercase text-primary fw-bold small mb-2">Firebase Authentication</p>
            <h1 class="h2 fw-bold mb-3">Create Library Account</h1>

            <div v-if="!isFirebaseConfigured" class="alert alert-warning">
              Firebase is not configured yet. Add your Firebase web app values to a local .env file.
            </div>

            <form novalidate @submit.prevent="registerUser">
              <div class="mb-3">
                <label for="displayName" class="form-label">Full name</label>
                <input
                  id="displayName"
                  v-model="displayName"
                  class="form-control"
                  autocomplete="name"
                  type="text"
                />
              </div>

              <div class="mb-3">
                <label for="registerEmail" class="form-label">Email address</label>
                <input
                  id="registerEmail"
                  v-model="email"
                  class="form-control"
                  autocomplete="email"
                  required
                  type="email"
                />
              </div>

              <div class="mb-3">
                <label for="registerPassword" class="form-label">Password</label>
                <input
                  id="registerPassword"
                  v-model="password"
                  class="form-control"
                  autocomplete="new-password"
                  required
                  type="password"
                />
              </div>

              <div class="mb-4">
                <label for="registerRole" class="form-label">Role</label>
                <select id="registerRole" v-model="selectedRole" class="form-select">
                  <option v-for="role in roleOptions" :key="role.value" :value="role.value">
                    {{ role.label }}
                  </option>
                </select>
              </div>

              <button class="btn btn-primary w-100" :disabled="isSubmitting || !isFirebaseConfigured">
                {{ isSubmitting ? 'Creating account...' : 'Register' }}
              </button>
            </form>

            <div v-if="message" class="alert mt-4" :class="messageClass">
              {{ message }}
            </div>

            <div v-if="registeredEmail" class="bg-light rounded-2 p-3 mt-4">
              <p class="mb-1"><strong>Registered user:</strong> {{ registeredEmail }}</p>
              <p class="mb-0"><strong>Selected role:</strong> {{ selectedRoleLabel }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { auth, isFirebaseConfigured } from '../firebase'

const roleOptions = [
  { value: 'member', label: 'Library Member' },
  { value: 'librarian', label: 'Librarian' },
  { value: 'admin', label: 'Administrator' }
]

const displayName = ref('')
const email = ref('')
const password = ref('')
const selectedRole = ref('member')
const registeredEmail = ref('')
const message = ref('')
const messageType = ref('success')
const isSubmitting = ref(false)

const selectedRoleLabel = computed(
  () => roleOptions.find((role) => role.value === selectedRole.value)?.label || 'Library Member'
)

const messageClass = computed(() =>
  messageType.value === 'success' ? 'alert-success' : 'alert-danger'
)

const registerUser = async () => {
  if (!auth) {
    messageType.value = 'error'
    message.value = 'Firebase configuration is missing.'
    return
  }

  isSubmitting.value = true
  message.value = ''

  try {
    const credential = await createUserWithEmailAndPassword(
      auth,
      email.value.trim(),
      password.value
    )

    if (displayName.value.trim()) {
      await updateProfile(credential.user, {
        displayName: `${displayName.value.trim()} (${selectedRoleLabel.value})`
      })
    }

    localStorage.setItem('nomashFirebaseRole', selectedRole.value)
    registeredEmail.value = credential.user.email
    messageType.value = 'success'
    message.value = 'Registration successful. Check Firebase Authentication users.'
    console.log('Registered Firebase user:', credential.user)
  } catch (error) {
    messageType.value = 'error'
    message.value = error.code || error.message
    console.error('Firebase registration error:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>
