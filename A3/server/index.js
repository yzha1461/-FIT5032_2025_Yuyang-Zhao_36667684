import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import crypto from 'node:crypto'
import jwt from 'jsonwebtoken'
import admin from 'firebase-admin'
import { Resend } from 'resend'
import { findUserByEmail, publicUser, ratings, requests, services, users, verifyPassword, nextId, calendarEvents } from './store.js'

const app = express()
const port = Number(process.env.PORT || 8787)
const secret = process.env.JWT_SECRET || 'a3-local-development-secret-change-me'
const failedLogins = new Map()
let firebaseAuth = null

if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
  admin.initializeApp({ credential: admin.credential.cert({ projectId: process.env.FIREBASE_PROJECT_ID, clientEmail: process.env.FIREBASE_CLIENT_EMAIL, privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') }) })
  firebaseAuth = admin.auth()
}

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }))
app.use(express.json({ limit: '6mb' }))
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  next()
})

function issueToken(user, provider = 'local') {
  return jwt.sign({ sub: user.id, role: user.role, email: user.email, provider }, secret, { expiresIn: '2h', issuer: 'silvercare-api' })
}

function auth(req, res, next) {
  const header = req.get('authorization') || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  if (!token) return res.status(401).json({ error: 'Authentication required.' })
  try {
    req.identity = jwt.verify(token, secret, { issuer: 'silvercare-api' })
    req.user = users.find((user) => user.id === req.identity.sub)
    if (!req.user || req.user.role !== req.identity.role) return res.status(403).json({ error: 'Authorisation failed.' })
    next()
  } catch {
    return res.status(401).json({ error: 'Session expired. Please sign in again.' })
  }
}

function requireRole(...roles) {
  return (req, res, next) => roles.includes(req.user?.role) ? next() : res.status(403).json({ error: 'This role cannot access the requested resource.' })
}

function validEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email) }
function validPassword(password) { return typeof password === 'string' && password.length >= 10 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password) && /[^A-Za-z0-9]/.test(password) }
function plainText(value, max = 300) { return typeof value === 'string' && value.length <= max && !/[<>]/.test(value) }
async function verifyFirebaseToken(token, expectedEmail) {
  if (!firebaseAuth) throw new Error('Firebase Admin credentials are not configured on the server.')
  const identity = await firebaseAuth.verifyIdToken(token)
  if (!identity.email || identity.email.toLowerCase() !== expectedEmail) throw new Error('Firebase token email does not match the requested account.')
  return identity
}

app.get('/api/health', (req, res) => res.json({ ok: true, service: 'silvercare-api', timestamp: new Date().toISOString() }))
app.get('/api/public/services', (req, res) => res.json({ services }))

app.post('/api/auth/login', async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase()
  const ip = req.ip
  const attempt = failedLogins.get(ip) || { count: 0, lockedUntil: 0 }
  if (attempt.lockedUntil > Date.now()) return res.status(429).json({ error: 'Too many attempts. Wait 30 seconds.' })
  const user = findUserByEmail(email)
  if (req.body?.providerToken) {
    try {
      await verifyFirebaseToken(String(req.body.providerToken), email)
      if (!user) return res.status(403).json({ error: 'This Firebase account is not provisioned for SilverCare Connect.' })
      failedLogins.delete(ip)
      return res.json({ token: issueToken(user, 'firebase'), user: publicUser(user) })
    } catch (error) { return res.status(401).json({ error: error.message }) }
  }
  if (!validEmail(email) || !verifyPassword(user, String(req.body?.password || ''))) {
    attempt.count += 1
    if (attempt.count >= 5) { attempt.count = 0; attempt.lockedUntil = Date.now() + 30_000 }
    failedLogins.set(ip, attempt)
    return res.status(401).json({ error: 'The email address or password is incorrect.' })
  }
  failedLogins.delete(ip)
  return res.json({ token: issueToken(user), user: publicUser(user) })
})

app.post('/api/auth/register', async (req, res) => {
  const name = String(req.body?.name || '').trim()
  const email = String(req.body?.email || '').trim().toLowerCase()
  const password = String(req.body?.password || '')
  if (!plainText(name, 60) || name.length < 2 || !validEmail(email) || (!req.body?.providerToken && !validPassword(password))) return res.status(400).json({ error: 'Name, email or password does not meet the required format.' })
  if (findUserByEmail(email)) return res.status(409).json({ error: 'An account already exists for this email.' })
  if (req.body?.providerToken) {
    try { await verifyFirebaseToken(String(req.body.providerToken), email) } catch (error) { return res.status(401).json({ error: error.message }) }
  }
  const salt = crypto.randomUUID()
  const user = { id: nextId('user'), name, email, role: 'member', salt, passwordHash: crypto.createHash('sha256').update(`${salt}:${password}`).digest('hex'), createdAt: new Date().toISOString() }
  users.push(user)
  return res.status(201).json({ token: issueToken(user), user: publicUser(user) })
})

app.get('/api/auth/me', auth, (req, res) => res.json({ user: publicUser(req.user) }))

app.get('/api/requests', auth, (req, res) => {
  const data = req.user.role === 'staff' ? requests : requests.filter((item) => item.userId === req.user.id)
  res.json({ requests: data })
})

app.post('/api/requests', auth, requireRole('member'), (req, res) => {
  const { serviceId, date, phone, notes = '' } = req.body || {}
  const service = services.find((item) => item.id === serviceId)
  if (!service || !/^\d{4}-\d{2}-\d{2}$/.test(String(date)) || !/^(?:\+?61|0)[2-478](?:[ -]?\d){8}$/.test(String(phone || '').trim()) || !plainText(notes)) return res.status(400).json({ error: 'Service, date, phone or notes are invalid.' })
  const request = { id: nextId('request'), userId: req.user.id, memberName: req.user.name, serviceId, serviceTitle: service.title, date, phone: phone.trim(), notes: notes.trim(), status: 'Pending', createdAt: new Date().toISOString() }
  requests.unshift(request)
  calendarEvents.push({ id: nextId('event'), title: service.title, start: date, extendedProps: { requestId: request.id } })
  res.status(201).json({ request })
})

app.patch('/api/requests/:id', auth, requireRole('staff'), (req, res) => {
  const request = requests.find((item) => item.id === req.params.id)
  if (!request || !['Pending', 'Confirmed', 'Completed'].includes(req.body?.status)) return res.status(400).json({ error: 'Invalid request or status.' })
  request.status = req.body.status
  res.json({ request })
})

app.get('/api/users', auth, requireRole('staff'), (req, res) => res.json({ users: users.map(publicUser) }))

app.get('/api/stats', auth, requireRole('staff'), (req, res) => {
  const byService = services.map((service) => {
    const values = ratings.filter((rating) => rating.serviceId === service.id)
    return { label: service.title, average: values.length ? values.reduce((sum, item) => sum + item.score, 0) / values.length : 0, count: values.length }
  })
  res.json({ members: users.filter((user) => user.role === 'member').length, requests: requests.length, pending: requests.filter((item) => item.status === 'Pending').length, byService })
})

app.get('/api/ratings', auth, (req, res) => res.json({ ratings }))
app.post('/api/ratings', auth, requireRole('member'), (req, res) => {
  const score = Number(req.body?.score)
  const serviceId = String(req.body?.serviceId || '')
  if (!services.some((item) => item.id === serviceId) || !Number.isInteger(score) || score < 1 || score > 5) return res.status(400).json({ error: 'Rating must be an integer from one to five.' })
  const existing = ratings.find((rating) => rating.serviceId === serviceId && rating.userId === req.user.id)
  if (existing) existing.score = score
  else ratings.push({ id: nextId('rating'), serviceId, userId: req.user.id, score })
  res.json({ ratings })
})

app.get('/api/calendar', auth, (req, res) => res.json({ events: calendarEvents }))
app.post('/api/calendar', auth, requireRole('staff'), (req, res) => {
  const { title, start } = req.body || {}
  if (!plainText(title, 100) || !/^\d{4}-\d{2}-\d{2}$/.test(String(start))) return res.status(400).json({ error: 'Calendar title or date is invalid.' })
  if (calendarEvents.some((event) => event.start === start)) return res.status(409).json({ error: 'Booking conflict: this date already has a scheduled support event.' })
  const event = { id: nextId('event'), title, start, extendedProps: {} }
  calendarEvents.push(event)
  res.status(201).json({ event })
})

app.post('/api/email/send', auth, requireRole('staff'), async (req, res) => {
  const { recipients, subject, body, attachment } = req.body || {}
  if (!Array.isArray(recipients) || !recipients.length || !plainText(subject, 150) || !plainText(body, 5000)) return res.status(400).json({ error: 'Recipients, subject or body are invalid.' })
  if (attachment && (!plainText(attachment.name, 120) || !plainText(attachment.type, 100) || typeof attachment.data !== 'string' || attachment.data.length > 7_000_000)) return res.status(400).json({ error: 'Attachment metadata or size is invalid.' })
  if (!process.env.RESEND_API_KEY) return res.status(202).json({ accepted: true, delivered: false, recipientCount: recipients.length, attachmentName: attachment?.name || null })
  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    const result = await resend.emails.send({ from: process.env.EMAIL_FROM || 'SilverCare Connect <onboarding@resend.dev>', to: recipients, subject, text: body, attachments: attachment ? [{ filename: attachment.name, content: Buffer.from(attachment.data, 'base64') }] : [] })
    if (result.error) return res.status(502).json({ error: 'The email provider rejected the message.' })
    return res.status(202).json({ accepted: true, delivered: true, recipientCount: recipients.length, attachmentName: attachment?.name || null })
  } catch { return res.status(502).json({ error: 'Email delivery is temporarily unavailable.' }) }
})

app.get('/api/requests.csv', auth, requireRole('staff'), (req, res) => {
  const header = 'Member,Service,Date,Phone,Status'
  const rows = requests.map((item) => [item.memberName, item.serviceTitle, item.date, item.phone, item.status].map((value) => `"${String(value).replaceAll('"', '""')}"`).join(','))
  res.type('text/csv').send([header, ...rows].join('\n'))
})

app.get('/api/geocode', auth, async (req, res) => {
  const query = String(req.query.q || '').trim()
  if (!query || query.length > 120) return res.status(400).json({ error: 'Search text is invalid.' })
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&q=${encodeURIComponent(query)}`, { headers: { 'User-Agent': 'SilverCareConnect-A3/1.0' } })
    res.json(await response.json())
  } catch { res.status(502).json({ error: 'The geocoding service is unavailable.' }) }
})

app.get('/api/route', auth, async (req, res) => {
  const { fromLat, fromLon, toLat, toLon } = req.query
  if (![fromLat, fromLon, toLat, toLon].every((value) => Number.isFinite(Number(value)))) return res.status(400).json({ error: 'Route coordinates are invalid.' })
  try {
    const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${fromLon},${fromLat};${toLon},${toLat}?overview=false`)
    res.json(await response.json())
  } catch { res.status(502).json({ error: 'The routing service is unavailable.' }) }
})

app.listen(port, () => console.log(`SilverCare API listening on http://127.0.0.1:${port}`))
