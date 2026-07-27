import { ref } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AboutView from '../views/AboutView.vue'
import LoginView from '../views/LoginView.vue'
import AccessDeniedView from '../views/AccessDeniedView.vue'
import VueConceptsView from '../views/VueConceptsView.vue'
import FirebaseRegisterView from '../views/FirebaseRegisterView.vue'
import FirebaseSigninView from '../views/FirebaseSigninView.vue'
import FirebaseLogoutView from '../views/FirebaseLogoutView.vue'

export const isAuthenticated = ref(false)

const validUser = {
  username: 'student',
  password: 'library123'
}

export const login = (username, password) => {
  const success = username.trim() === validUser.username && password.trim() === validUser.password
  isAuthenticated.value = success
  return success
}

export const logout = () => {
  isAuthenticated.value = false
}

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/about',
    name: 'about',
    component: AboutView,
    meta: { requiresAuth: true }
  },
  {
    path: '/vue-concepts',
    name: 'vue-concepts',
    component: VueConceptsView
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView
  },
  {
    path: '/firebase-register',
    name: 'firebase-register',
    component: FirebaseRegisterView
  },
  {
    path: '/firebase-signin',
    name: 'firebase-signin',
    component: FirebaseSigninView
  },
  {
    path: '/firebase-logout',
    name: 'firebase-logout',
    component: FirebaseLogoutView
  },
  {
    path: '/access-denied',
    name: 'access-denied',
    component: AccessDeniedView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to) => {
  if (to.meta.requiresAuth && !isAuthenticated.value) {
    return {
      name: 'access-denied',
      query: { redirect: to.fullPath }
    }
  }

  if (to.name === 'login' && isAuthenticated.value) {
    return { name: 'about' }
  }
})

export default router
