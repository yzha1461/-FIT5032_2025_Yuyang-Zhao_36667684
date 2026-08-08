import { getApp, getApps, initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyBtB76V0mzfazDzc5ouwMJ_UvsYUuXv6k8',
  authDomain: 'yuyang-zhao.firebaseapp.com',
  projectId: 'yuyang-zhao',
  storageBucket: 'yuyang-zhao.firebasestorage.app',
  messagingSenderId: '149589311467',
  appId: '1:149589311467:web:3e472cced463ea682ae3ae'
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig)

const auth = getAuth(app)
const db = getFirestore(app)

export const isFirebaseConfigured = true
export { app, auth, db }
