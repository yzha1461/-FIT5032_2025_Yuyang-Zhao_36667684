const base = import.meta.env.VITE_API_BASE_URL || '/api'
let authToken = sessionStorage.getItem('silvercare_a3_token') || ''

export function setToken(token) {
  authToken = token || ''
  if (authToken) sessionStorage.setItem('silvercare_a3_token', authToken)
  else sessionStorage.removeItem('silvercare_a3_token')
}

export function getToken() { return authToken }

export async function api(path, options = {}) {
  const headers = new Headers(options.headers || {})
  if (options.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  if (authToken) headers.set('Authorization', `Bearer ${authToken}`)
  const response = await fetch(`${base}${path}`, { ...options, headers })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(payload.error || `Request failed (${response.status})`)
  return payload
}

export const apiGet = (path) => api(path)
export const apiPost = (path, body) => api(path, { method: 'POST', body: JSON.stringify(body) })
export const apiPatch = (path, body) => api(path, { method: 'PATCH', body: JSON.stringify(body) })
