import { createApp } from 'vue'
import { getApp, getApps, initializeApp } from 'firebase/app'
import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'
import App from './App.vue'
import router from './router'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

const app = createApp(App)

app.use(PrimeVue, {
  theme: {
    preset: Aura
  }
})
app.use(router)

app.mount('#app')

// Import the functions you need from the SDKs you need
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyBtB76V0mzfazDzc5ouwMJ_UvsYUuXv6k8',
  authDomain: 'yuyang-zhao.firebaseapp.com',
  projectId: 'yuyang-zhao',
  storageBucket: 'yuyang-zhao.firebasestorage.app',
  messagingSenderId: '149589311467',
  appId: '1:149589311467:web:3e472cced463ea682ae3ae'
}

// Initialize Firebase
const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig)
console.log('Firebase app initialized:', firebaseApp.name)
