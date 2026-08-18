import crypto from 'node:crypto'

export const services = [
  { id: 'health-check', title: 'Community health check', summary: 'A friendly wellbeing check with clear next-step advice.' },
  { id: 'home-visit', title: 'Volunteer home visit', summary: 'Practical support and companionship at home.' },
  { id: 'transport', title: 'Appointment transport', summary: 'A safe lift to a clinic or community centre.' },
  { id: 'social', title: 'Social connection visit', summary: 'Conversation and an activity with a trained volunteer.' },
]

const passwordDigest = (password, salt) => crypto.createHash('sha256').update(`${salt}:${password}`).digest('hex')
const seededUser = (id, name, email, role, password) => {
  const salt = `silvercare-${id}`
  return { id, name, email, role, salt, passwordHash: passwordDigest(password, salt), createdAt: new Date().toISOString() }
}

export const users = [
  seededUser('member-demo', 'Margaret Wilson', 'member@silvercare.test', 'member', 'Care123!Secure'),
  seededUser('staff-demo', 'Sofia Patel', 'staff@silvercare.test', 'staff', 'Staff123!Secure'),
]

export const requests = [
  { id: 'request-demo', userId: 'member-demo', memberName: 'Margaret Wilson', serviceId: 'health-check', serviceTitle: 'Community health check', date: '2026-08-25', phone: '0400 123 456', notes: 'Please call before arrival.', status: 'Pending', createdAt: new Date().toISOString() },
]

export const ratings = [
  { id: 'rating-demo', serviceId: 'health-check', userId: 'member-demo', score: 5 },
]

export const calendarEvents = [
  { id: 'event-demo', title: 'Community health check', start: '2026-08-25', extendedProps: { requestId: 'request-demo' } },
]

export function nextId(prefix) {
  return `${prefix}-${crypto.randomUUID()}`
}

export function findUserByEmail(email) {
  return users.find((user) => user.email === email.toLowerCase())
}

export function publicUser(user) {
  const { passwordHash, salt, ...safeUser } = user
  return safeUser
}

export function verifyPassword(user, password) {
  if (!user) return false
  const digest = passwordDigest(password, user.salt)
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(user.passwordHash))
}
