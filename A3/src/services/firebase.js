import { initializeApp, getApps } from 'firebase/app'
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth'

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const firebaseEnabled = Object.values(config).every(Boolean)
const app = firebaseEnabled ? (getApps()[0] || initializeApp(config)) : null
export const firebaseAuth = app ? getAuth(app) : null

export async function firebaseLogin(email, password) {
  if (!firebaseAuth) return null
  const credential = await signInWithEmailAndPassword(firebaseAuth, email, password)
  return { token: await credential.user.getIdToken(), provider: 'firebase' }
}

export async function firebaseRegister(email, password) {
  if (!firebaseAuth) return null
  const credential = await createUserWithEmailAndPassword(firebaseAuth, email, password)
  return { token: await credential.user.getIdToken(), provider: 'firebase' }
}

export async function firebaseLogout() {
  if (firebaseAuth) await signOut(firebaseAuth)
}
