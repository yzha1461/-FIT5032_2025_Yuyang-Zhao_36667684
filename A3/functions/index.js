import { onRequest } from 'firebase-functions/v2/https'
import { setGlobalOptions } from 'firebase-functions/v2'
import { defineSecret } from 'firebase-functions/params'
import logger from 'firebase-functions/logger'
import admin from 'firebase-admin'
import { app } from './server.js'

const resendApiKey = defineSecret('RESEND_API_KEY')
const jwtSecret = defineSecret('JWT_SECRET')

if (admin.apps.length === 0) admin.initializeApp()
setGlobalOptions({ region: 'australia-southeast1', maxInstances: 10 })

export const apiHealth = onRequest((request, response) => response.json({ ok: true, function: 'apiHealth' }))

export const apiStats = onRequest(async (request, response) => {
  try {
    const token = String(request.headers.authorization || '').replace('Bearer ', '')
    const identity = await admin.auth().verifyIdToken(token)
    if (identity.role !== 'staff') return response.status(403).json({ error: 'Staff role required.' })
    const snapshot = await admin.firestore().collection('supportRequests').get()
    const pending = snapshot.docs.filter((doc) => doc.data().status === 'Pending').length
    return response.json({ requests: snapshot.size, pending })
  } catch (error) {
    logger.warn('apiStats rejected request', { message: error.message })
    return response.status(401).json({ error: 'A verified Firebase token is required.' })
  }
})

export const apiSendEmail = onRequest(async (request, response) => {
  try {
    const token = String(request.headers.authorization || '').replace('Bearer ', '')
    const identity = await admin.auth().verifyIdToken(token)
    if (identity.role !== 'staff') return response.status(403).json({ error: 'Staff role required.' })
    const { recipients = [], subject = '', attachment = null } = request.body || {}
    if (!recipients.length || subject.length > 150) return response.status(400).json({ error: 'Invalid email payload.' })
    // The complete production email implementation is mounted at /api/email/send in server.js.
    return response.status(202).json({ accepted: true, recipients: recipients.length, attachment: attachment?.name || null })
  } catch { return response.status(401).json({ error: 'A verified Firebase token is required.' }) }
})

// Full Express API used by the public Firebase Hosting application.
export const api = onRequest({ secrets: [resendApiKey, jwtSecret] }, app)
