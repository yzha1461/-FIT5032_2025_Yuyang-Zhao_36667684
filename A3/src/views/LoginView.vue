<script setup>
import { reactive, ref } from 'vue'
import { HeartHandshake, ShieldCheck, UserRound } from 'lucide-vue-next'
import { firebaseEnabled, firebaseLogin, firebaseRegister } from '../services/firebase'
import { apiPost, setToken } from '../services/api'

const emit = defineEmits(['authenticated'])
const mode = ref('login')
const form = reactive({ name: '', email: '', password: '', confirmPassword: '' })
const error = ref('')
const message = ref('')
const pending = ref(false)

function validPassword(value) { return value.length >= 10 && /[a-z]/.test(value) && /[A-Z]/.test(value) && /\d/.test(value) && /[^A-Za-z0-9]/.test(value) }
async function submit() {
  error.value = ''; message.value = ''; pending.value = true
  try {
    if (mode.value === 'register') {
      if (form.password !== form.confirmPassword || !validPassword(form.password)) throw new Error('Use matching passwords with 10+ characters, upper-case, lower-case, number and symbol.')
      const firebaseResult = firebaseEnabled ? await firebaseRegister(form.email, form.password) : null
      const result = firebaseResult ? await apiPost('/auth/register', { name: form.name, email: form.email, password: form.password, providerToken: firebaseResult.token }) : await apiPost('/auth/register', { name: form.name, email: form.email, password: form.password })
      setToken(result.token); emit('authenticated', result.user); return
    }
    const firebaseResult = firebaseEnabled ? await firebaseLogin(form.email, form.password) : null
    const result = firebaseResult ? await apiPost('/auth/login', { email: form.email, providerToken: firebaseResult.token }) : await apiPost('/auth/login', { email: form.email, password: form.password })
    setToken(result.token); emit('authenticated', result.user)
  } catch (cause) { error.value = cause.message } finally { pending.value = false }
}
async function demo(role) { form.email = role === 'staff' ? 'staff@silvercare.test' : 'member@silvercare.test'; form.password = role === 'staff' ? 'Staff123!Secure' : 'Care123!Secure'; mode.value = 'login'; await submit() }
</script>

<template>
  <main class="auth-layout" id="main-content"><section class="auth-intro"><p class="eyebrow">SilverCare Connect A3</p><h1>Support coordination with people at the centre.</h1><p class="lead">Advanced tools for members, caregivers and charity staff, with secure server-side role checks.</p><img src="/community-care.svg" alt="A support worker and older adult reviewing a care plan"></section><section class="auth-panel" :aria-labelledby="`${mode}-title`"><form @submit.prevent="submit"><p class="eyebrow">{{ mode === 'login' ? 'Welcome back' : 'New member' }}</p><h2 :id="`${mode}-title`">{{ mode === 'login' ? 'Sign in' : 'Create an account' }}</h2><p v-if="firebaseEnabled" class="provider-note"><ShieldCheck :size="16" /> Firebase Authentication enabled</p><div v-if="error" class="alert error" role="alert">{{ error }}</div><div v-if="message" class="alert success" role="status">{{ message }}</div><label v-if="mode === 'register'">Full name<input v-model="form.name" type="text" autocomplete="name" minlength="2" maxlength="60" required></label><label>Email address<input v-model="form.email" type="email" autocomplete="email" required></label><label>Password<input v-model="form.password" type="password" autocomplete="current-password" required></label><label v-if="mode === 'register'">Confirm password<input v-model="form.confirmPassword" type="password" autocomplete="new-password" required></label><button class="primary-button full-button" type="submit" :disabled="pending">{{ pending ? 'Working...' : mode === 'login' ? 'Sign in' : 'Create account' }}</button><button class="text-button full-button" type="button" @click="mode = mode === 'login' ? 'register' : 'login'; error = ''">{{ mode === 'login' ? 'Create a member account' : 'Back to sign in' }}</button><div v-if="mode === 'login'" class="demo-access"><span>Demonstration access</span><button type="button" @click="demo('member')"><UserRound :size="17" /> Member</button><button type="button" @click="demo('staff')"><ShieldCheck :size="17" /> Staff</button></div></form></section></main>
</template>
