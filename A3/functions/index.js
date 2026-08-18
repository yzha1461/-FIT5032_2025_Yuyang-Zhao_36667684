import { onRequest } from 'firebase-functions/v2/https'
import { setGlobalOptions } from 'firebase-functions/v2'
import logger from 'firebase-functions/logger'
import admin from 'firebase-admin'

admin.initializeApp()
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
    // Connect this validated payload to SendGrid/Resend through Secret Manager in production.
    return response.status(202).json({ accepted: true, recipients: recipients.length, attachment: attachment?.name || null })
  } catch { return response.status(401).json({ error: 'A verified Firebase token is required.' }) }
})
